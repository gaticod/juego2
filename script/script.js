 function openModal() {
      document.getElementById('modalOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      document.getElementById('modalOverlay').classList.remove('active');
      document.body.style.overflow = 'auto';
    }

    function closeModalOnOverlay(event) {
      if (event.target.id === 'modalOverlay') {
        closeModal();
      }
    }

    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });