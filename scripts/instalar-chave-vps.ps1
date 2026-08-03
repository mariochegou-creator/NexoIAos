# Instala a chave publica desta maquina no servidor, para acesso sem senha.
# Rode UMA vez. Vai pedir a senha do root — e essa e a ultima vez que voce digita.
#
#   .\scripts\instalar-chave-vps.ps1

$ErrorActionPreference = "Stop"
$servidor = "root@145.223.94.63"
$chave = "$env:USERPROFILE\.ssh\id_ed25519.pub"

if (-not (Test-Path $chave)) {
  Write-Host "Chave nao encontrada em $chave" -ForegroundColor Red
  exit 1
}

Write-Host "Instalando a chave em $servidor ..." -ForegroundColor Cyan
Get-Content $chave | ssh $servidor "mkdir -p .ssh; chmod 700 .ssh; cat >> .ssh/authorized_keys; chmod 600 .ssh/authorized_keys"

Write-Host "`nTestando acesso sem senha..." -ForegroundColor Cyan
$teste = ssh -o BatchMode=yes -o ConnectTimeout=10 $servidor "hostname; echo OK"

if ($teste -match "OK") {
  Write-Host "`nFuncionou. A partir de agora o acesso e sem senha." -ForegroundColor Green
  Write-Host $teste
} else {
  Write-Host "`nNao funcionou. Saida:" -ForegroundColor Red
  Write-Host $teste
}
