# Run Command And Report DevSecOps (DSO) Event GitHub Action

This GitHub Action allows you to run a command that triggers a DevSecOps (DSO) event, such as a deployment or test run, and send data about the event to the MACBIS DSO Metrics API.

## Inputs

| Input | Description | Required | Default |
| --- | --- | --- | --- |
| `command` | The command to run that triggers a DSO event (e.g. a deployment or test run) | Yes | N/A |
| `aws-account-id` | The AWS account ID containing the DSO Metrics cross-account role used for reporting the event | Yes | N/A |
| `event-type` | The event type. Must be one of "deploy" or "test" | Yes | N/A |
| `app` | The app corresponding to the event | Yes | N/A |
| `team` | The team corresponding to the event | Yes | N/A |
| `environment` | The environment corresponding to the event (can be "none") | Yes | N/A |
| `id` | The unique identifier of the event. See documentation (TODO) for choosing an ID | Yes | N/A |
| `oidc-role` | The OIDC role to assume that has permission to assume the DSO Metrics cross-account role. If not provided, AWS credentials with this permission must be set in the environment when this action is run | No | N/A |
| `oidc-role-session-name` | OIDC role session name | No | 'ReportDSOEvent' |
| `aws-region` | AWS region | No | 'us-east-1' |
| `report-event-version` | The version constraint for the Enterprise-CMCS/mac-fc-dso-metrics/cmd/report-event program in semantic version syntax. Defaults to the latest version (we recommend pinning to a specific version or range) | No | Latest version |

## Usage

Here's an example of how to use this action in your workflow:

```yaml
- name: Run Command And Report DSO Event
  uses: Enterprise-CMCS/mac-fc-report-dso-event@0.2.2
  with:
    command: go test ./...
    event-type: test
    app: my-app
    team: my-team
    environment: none
    id: ${{ github.run_id }}-go-test
    aws-account-id: 123456789012
    oidc-role: arn:aws:iam::123456789012:role/example-role
```



