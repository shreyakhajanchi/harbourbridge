// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
package streaming

import (
	"testing"

	"github.com/GoogleCloudPlatform/spanner-migration-tool/internal"
	"github.com/GoogleCloudPlatform/spanner-migration-tool/profiles"
	"github.com/stretchr/testify/assert"
	datastreampb "google.golang.org/genproto/googleapis/cloud/datastream/v1"
)

func TestGetPostgreSQLSourceStreamConfig(t *testing.T) {
	testCases := []struct {
		name        string
		input       DatastreamCfg
		expectedCfg *datastreampb.SourceConfig_PostgresqlSourceConfig
		err         error
	}{
		{
			name: "Valid datastream configuration with two schemas",
			input: DatastreamCfg{
				Properties: "replicationSlot=rep1,publication=pub1",
				SchemaDetails: map[string]internal.SchemaDetails{
					"public": {
						TableDetails: []internal.TableDetails{
							{
								TableName: "table1",
							},
							{
								TableName: "table2",
							},
						},
					},
					"special": {
						TableDetails: []internal.TableDetails{
							{
								TableName: "special.table1",
							},
							{
								TableName: "special.table2",
							},
						},
					},
				},
			},
			expectedCfg: &datastreampb.SourceConfig_PostgresqlSourceConfig{
				PostgresqlSourceConfig: &datastreampb.PostgresqlSourceConfig{
					IncludeObjects: &datastreampb.PostgresqlRdbms{PostgresqlSchemas: []*datastreampb.PostgresqlSchema{
						{
							Schema: "public",
							PostgresqlTables: []*datastreampb.PostgresqlTable{
								{
									Table: "table1",
								},
								{
									Table: "table2",
								},
							},
						},
						{
							Schema: "special",
							PostgresqlTables: []*datastreampb.PostgresqlTable{
								{
									Table: "table1",
								},
								{
									Table: "table2",
								},
							},
						},
					}},
					MaxConcurrentBackfillTasks: 50,
					ReplicationSlot:            "rep1",
					Publication:                "pub1",
				},
			},
			err: nil,
		},
		{
			name: "Valid datastream configuration with only public schema",
			input: DatastreamCfg{
				Properties: "replicationSlot=rep1,publication=pub1",
				SchemaDetails: map[string]internal.SchemaDetails{
					"public": {
						TableDetails: []internal.TableDetails{
							{
								TableName: "table1",
							},
							{
								TableName: "table2",
							},
							{
								TableName: "table3",
							},
						},
					},
				},
			},
			expectedCfg: &datastreampb.SourceConfig_PostgresqlSourceConfig{
				PostgresqlSourceConfig: &datastreampb.PostgresqlSourceConfig{
					IncludeObjects: &datastreampb.PostgresqlRdbms{PostgresqlSchemas: []*datastreampb.PostgresqlSchema{
						{
							Schema: "public",
							PostgresqlTables: []*datastreampb.PostgresqlTable{
								{
									Table: "table1",
								},
								{
									Table: "table2",
								},
								{
									Table: "table3",
								},
							},
						},
					}},
					MaxConcurrentBackfillTasks: 50,
					ReplicationSlot:            "rep1",
					Publication:                "pub1",
				},
			},
			err: nil,
		},
		{
			name: "Valid datastream configuration with non-public schema",
			input: DatastreamCfg{
				Properties: "replicationSlot=rep1,publication=pub1",
				SchemaDetails: map[string]internal.SchemaDetails{
					"special": {
						TableDetails: []internal.TableDetails{
							{
								TableName: "special.table1",
							},
							{
								TableName: "special.table2",
							},
							{
								TableName: "special.table3",
							},
						},
					},
				},
			},
			expectedCfg: &datastreampb.SourceConfig_PostgresqlSourceConfig{
				PostgresqlSourceConfig: &datastreampb.PostgresqlSourceConfig{
					IncludeObjects: &datastreampb.PostgresqlRdbms{PostgresqlSchemas: []*datastreampb.PostgresqlSchema{
						{
							Schema: "special",
							PostgresqlTables: []*datastreampb.PostgresqlTable{
								{
									Table: "table1",
								},
								{
									Table: "table2",
								},
								{
									Table: "table3",
								},
							},
						},
					}},
					MaxConcurrentBackfillTasks: 50,
					ReplicationSlot:            "rep1",
					Publication:                "pub1",
				},
			},
			err: nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result, err := getPostgreSQLSourceStreamConfig(tc.input)
			assertEqualPostgresqlSourceConfig(t, tc.expectedCfg, result)
			assert.Equal(t, tc.err, err)
		})
	}
}

func TestGetMySQLSourceStreamConfig(t *testing.T) {
	testCases := []struct {
		name        string
		inputCfg    DatastreamCfg
		dbList      []profiles.LogicalShard
		expectedCfg *datastreampb.SourceConfig_MysqlSourceConfig
		err         error
	}{
		{
			name: "Valid datastream configuration with single database",
			inputCfg: DatastreamCfg{
				SchemaDetails: map[string]internal.SchemaDetails{
					"db1": {
						TableDetails: []internal.TableDetails{
							{
								TableName: "table1",
							},
							{
								TableName: "table2",
							},
						},
					},
				},
			},
			dbList: []profiles.LogicalShard{
				{
					DbName:         "db1",
					LogicalShardId: "l1",
					RefDataShardId: "x1",
				},
			},
			expectedCfg: &datastreampb.SourceConfig_MysqlSourceConfig{
				MysqlSourceConfig: &datastreampb.MysqlSourceConfig{
					IncludeObjects: &datastreampb.MysqlRdbms{MysqlDatabases: []*datastreampb.MysqlDatabase{
						{
							Database: "db1",
							MysqlTables: []*datastreampb.MysqlTable{
								{
									Table: "table1",
								},
								{
									Table: "table2",
								},
							},
						},
					}},
					MaxConcurrentBackfillTasks: 50,
					MaxConcurrentCdcTasks:      5,
				},
			},
			err: nil,
		},
		{
			name: "Valid datastream configuration with multiple database",
			inputCfg: DatastreamCfg{
				SchemaDetails: map[string]internal.SchemaDetails{
					"db1": {
						TableDetails: []internal.TableDetails{
							{
								TableName: "table1",
							},
							{
								TableName: "table2",
							},
						},
					},
				},
			},
			dbList: []profiles.LogicalShard{
				{
					DbName:         "db1",
					LogicalShardId: "l1",
					RefDataShardId: "x1",
				},
				{
					DbName:         "db2",
					LogicalShardId: "l2",
					RefDataShardId: "x2",
				},
			},
			expectedCfg: &datastreampb.SourceConfig_MysqlSourceConfig{
				MysqlSourceConfig: &datastreampb.MysqlSourceConfig{
					IncludeObjects: &datastreampb.MysqlRdbms{MysqlDatabases: []*datastreampb.MysqlDatabase{
						{
							Database: "db1",
							MysqlTables: []*datastreampb.MysqlTable{
								{
									Table: "table1",
								},
								{
									Table: "table2",
								},
							},
						},
						{
							Database: "db2",
							MysqlTables: []*datastreampb.MysqlTable{
								{
									Table: "table1",
								},
								{
									Table: "table2",
								},
							},
						},
					}},
					MaxConcurrentBackfillTasks: 50,
					MaxConcurrentCdcTasks:      5,
				},
			},
			err: nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			result, err := getMysqlSourceStreamConfig(tc.dbList, tc.inputCfg)
			assertEqualMysqlSourceConfig(t, tc.expectedCfg, result)
			assert.Equal(t, tc.err, err)
		})
	}
}

func assertEqualMysqlSourceConfig(t *testing.T, expected, actual *datastreampb.SourceConfig_MysqlSourceConfig) {
	assert.Equal(t, expected.MysqlSourceConfig.MaxConcurrentBackfillTasks, actual.MysqlSourceConfig.MaxConcurrentBackfillTasks)
	assert.Equal(t, expected.MysqlSourceConfig.MaxConcurrentCdcTasks, actual.MysqlSourceConfig.MaxConcurrentCdcTasks)

	for i := range expected.MysqlSourceConfig.IncludeObjects.MysqlDatabases {
		assert.Equal(t, expected.MysqlSourceConfig.IncludeObjects.MysqlDatabases[i].Database, actual.MysqlSourceConfig.IncludeObjects.MysqlDatabases[i].Database)
		for j := range expected.MysqlSourceConfig.IncludeObjects.MysqlDatabases[i].MysqlTables {
			assert.Equal(t, expected.MysqlSourceConfig.IncludeObjects.MysqlDatabases[i].MysqlTables[j].Table, actual.MysqlSourceConfig.IncludeObjects.MysqlDatabases[i].MysqlTables[j].Table)
		}
	}
}

func assertEqualPostgresqlSourceConfig(t *testing.T, expected, actual *datastreampb.SourceConfig_PostgresqlSourceConfig) {
	assert.Equal(t, expected.PostgresqlSourceConfig.MaxConcurrentBackfillTasks, actual.PostgresqlSourceConfig.MaxConcurrentBackfillTasks)
	assert.Equal(t, expected.PostgresqlSourceConfig.ReplicationSlot, actual.PostgresqlSourceConfig.ReplicationSlot)
	assert.Equal(t, expected.PostgresqlSourceConfig.Publication, actual.PostgresqlSourceConfig.Publication)

	for i := range expected.PostgresqlSourceConfig.IncludeObjects.PostgresqlSchemas {
		assert.Equal(t, expected.PostgresqlSourceConfig.IncludeObjects.PostgresqlSchemas[i].Schema, actual.PostgresqlSourceConfig.IncludeObjects.PostgresqlSchemas[i].Schema)
		for j := range expected.PostgresqlSourceConfig.IncludeObjects.PostgresqlSchemas[i].PostgresqlTables {
			assert.Equal(t, expected.PostgresqlSourceConfig.IncludeObjects.PostgresqlSchemas[i].PostgresqlTables[j].Table, actual.PostgresqlSourceConfig.IncludeObjects.PostgresqlSchemas[i].PostgresqlTables[j].Table)
		}
	}
}
