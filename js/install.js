(() => {
  'use strict';

  let deferredInstallPrompt = null;
  const installed = () => window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  const updateInstalled = () => document.body.classList.toggle('rep-installed', installed());

  // O navegador escolhe quando disponibilizar a instalação nativa.
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    document.body.classList.add('rep-installed');
  });

  function closeHelp() {
    const overlay = document.getElementById('install-help-overlay');
    if (overlay) {
      overlay.remove();
      document.removeEventListener('keydown', closeOnEscape);
    }
  }
  function closeOnEscape(event) {if (event.key === 'Escape') closeHelp();}

  function showHelp() {
    closeHelp();
    const ios = /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(navigator.userAgent);
    const steps = ios
      ? ['Abra o REP no <strong>Safari</strong>.', 'Toque em <strong>Compartilhar</strong> (quadrado com seta para cima).', 'Escolha <strong>Adicionar à Tela de Início</strong> e confirme em <strong>Adicionar</strong>.']
      : android
        ? ['Abra o REP no <strong>Chrome</strong>.', 'Toque no menu de <strong>três pontos (⋮)</strong>.', 'Escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.']
        : ['Abra o REP no <strong>Chrome</strong> ou <strong>Edge</strong>.', 'Abra o menu do navegador e escolha <strong>Instalar página como app</strong> ou <strong>Aplicativos → Instalar</strong>, conforme sua versão.', 'Confirme a instalação para criar o atalho do REP.'];
    const overlay = document.createElement('div');
    overlay.className = 'install-help-overlay';
    overlay.id = 'install-help-overlay';
    overlay.innerHTML = `<section class="install-help-dialog" role="dialog" aria-modal="true" aria-labelledby="install-help-title">
      <button class="install-help-close" type="button" data-close-install aria-label="Fechar instruções">×</button>
      <h2 id="install-help-title">Instalar app</h2>
      <p>Coloque o REP na tela inicial e abra em uma janela própria, como aplicativo. Seus registros continuam armazenados localmente.</p>
      <ol>${steps.map(step=>`<li>${step}</li>`).join('')}</ol>
      <button class="install-help-done" type="button" data-close-install>Entendi</button>
    </section>`;
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('[data-close-install]')) closeHelp();
    });
    document.body.appendChild(overlay);
    document.addEventListener('keydown', closeOnEscape);
    overlay.querySelector('.install-help-close').focus();
  }

  document.addEventListener('click', async (event) => {
    const control = event.target.closest('[data-install-app]');
    if (!control) return;
    event.preventDefault();
    if (installed()) {updateInstalled();return;}
    if (deferredInstallPrompt) {
      const prompt = deferredInstallPrompt;
      deferredInstallPrompt = null;
      try {
        await prompt.prompt();
        await prompt.userChoice;
      } catch (error) {
        console.warn('Instalação do REP não pôde ser iniciada:', error);
        showHelp();
      }
      return;
    }
    showHelp();
  });
  updateInstalled();
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    let refreshing = false;
    // A versão instalada pode manter uma página antiga aberta por vários dias.
    // Ao ativar uma versão nova, recarrega a interface sem apagar o localStorage.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing || document.getElementById('rest-timer')) return;
      refreshing = true;
      window.location.reload();
    });

    const checkUpdates = () => {
      navigator.serviceWorker.getRegistration('./')
        .then(registration => registration?.update())
        .catch(error => console.warn('Não foi possível verificar atualizações do REP:', error));
    };
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'})
        .then(registration => registration.update())
        .catch(error => console.warn('O REP não conseguiu ativar o modo offline:', error));
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) checkUpdates();
    });
    window.addEventListener('pageshow', event => {
      if (event.persisted) checkUpdates();
    });
  }
})();