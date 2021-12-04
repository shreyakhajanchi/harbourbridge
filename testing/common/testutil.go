package common

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
)

func RunCommand(args string, projectID string) error {
	// Be aware that when testing with the command, the time `now` might be
	// different between file prefixes and the contents in the files. This
	// is because file prefixes use `now` from here (the test function) and
	// the generated time in the files uses a `now` inside the command, which
	// can be different.
	cmd := exec.Command("bash", "-c", fmt.Sprintf("go run github.com/cloudspannerecosystem/harbourbridge %v", args))
	var out, stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr
	cmd.Env = append(os.Environ(),
		fmt.Sprintf("GCLOUD_PROJECT=%s", projectID),
	)
	if err := cmd.Run(); err != nil {
		fmt.Printf("stdout: %q\n", out.String())
		fmt.Printf("stderr: %q\n", stderr.String())
		return err
	}
	fmt.Printf("stdout: %q\n", out.String())
	return nil
}

// Clears the env variables specified in the input list and stashes the values
// in a map.
func ClearEnvVariables(vars []string) map[string]string {
	envVars := make(map[string]string)
	for _, v := range vars {
		envVars[v] = os.Getenv(v)
		os.Setenv(v, "")
	}
	return envVars
}

func RestoreEnvVariables(params map[string]string) {
	for k, v := range params {
		os.Setenv(k, v)
	}
}
