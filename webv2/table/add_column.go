// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package table

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/cloudspannerecosystem/harbourbridge/internal"
	"github.com/cloudspannerecosystem/harbourbridge/spanner/ddl"
	"github.com/cloudspannerecosystem/harbourbridge/webv2/session"
)

type columnDetails struct {
	Name       string `json:"Name"`
	Datatype   string `json:"Datatype"`
	Length     int    `json:"Length"`
	IsNullable bool   `json:"IsNullable"`
}

// addColumn add given column into spannerTable.
func addColumn(tableId string, colId string, conv *internal.Conv) {

	sp := conv.SpSchema[tableId]

	spColName, _ := internal.GetSpannerCol(conv, tableId, colId, conv.SpSchema[tableId].ColDefs)

	sp.ColDefs[colId] = ddl.ColumnDef{
		Id:   colId,
		Name: spColName,
	}

	if !IsColumnPresentInColNames(sp.ColIds, colId) {

		sp.ColIds = append(sp.ColIds, colId)

	}

	conv.SpSchema[tableId] = sp
}

func AddNewColumn(w http.ResponseWriter, r *http.Request) {
	log.Println("request started", "method", r.Method, "path", r.URL.Path)
	reqBody, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Println("request's body Read Error")
		http.Error(w, fmt.Sprintf("Body Read Error : %v", err), http.StatusInternalServerError)
	}
	tableId := r.FormValue("table")
	details := columnDetails{}
	err = json.Unmarshal(reqBody, &details)
	if err != nil {
		log.Println("request's Body parse error")
		http.Error(w, fmt.Sprintf("Request Body parse error : %v", err), http.StatusBadRequest)
		return
	}
	sessionState := session.GetSessionState()
	ct := sessionState.Conv.SpSchema[tableId]
	columnId := internal.GenerateColumnId()
	ct.ColIds = append(ct.ColIds, columnId)
	ct.ColDefs[columnId] = ddl.ColumnDef{Name: details.Name, Id: columnId, T: ddl.Type{Name: details.Datatype, Len: int64(details.Length)}, NotNull: !details.IsNullable}
	sessionState.Conv.SpSchema[tableId] = ct
	convm := session.ConvWithMetadata{
		SessionMetadata: sessionState.SessionMetadata,
		Conv:            *sessionState.Conv,
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(convm)
}
