$ErrorActionPreference = 'Stop'
foreach ($task in @('lint','test','build')) {
 npm run $task
 if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
