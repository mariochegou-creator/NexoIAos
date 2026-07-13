# Corrigir Dashboard NEXO IA — extensão do Chrome

Botãozinho que limpa só o cache do `dashboard.nexoialocal.com.br` (cache, cache storage e
service worker) e recarrega a aba — sem apagar seu login. Usar sempre que o dashboard mostrar
uma versão desatualizada e a página não estiver refletindo uma atualização recente.

## Como instalar (uma vez só)

1. Abrir o Chrome e digitar na barra de endereço: `chrome://extensions`
2. Ativar o **"Modo do desenvolvedor"** (canto superior direito).
3. Clicar em **"Carregar sem compactação"** (ou "Load unpacked").
4. Selecionar esta pasta: `MazyOS/ferramentas/extensao-corrigir-dashboard`.
5. Pronto — o ícone aparece na barra de extensões do Chrome (ícone de peça de quebra-cabeça,
   pode fixar clicando no alfinete pra ele ficar sempre visível).

## Como usar

Sempre que o dashboard aparecer desatualizado: clicar no ícone da extensão → **"Corrigir agora"**.
A aba do dashboard recarrega sozinha já com a versão nova.

## Por quê

O servidor do dashboard (Cloudflare Pages) sempre entrega a versão mais nova — o problema é
o Chrome guardando uma cópia antiga em cache local (às vezes um service worker antigo insiste
em servir essa cópia mesmo depois de "Limpar dados de navegação" pelo menu padrão). Essa
extensão usa a API `chrome.browsingData` pra limpar especificamente esse cache, sem afetar
mais nada do navegador.
