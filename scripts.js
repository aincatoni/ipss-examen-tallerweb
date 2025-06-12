
    const form = document.querySelector('form');
    const tableBody = document.querySelector('tbody');

    // Utilidad para mostrar el modal de confirmación
    function showModal(message, onConfirm) {
      // Crear modal básico
      let modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Confirmación</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
              <p>${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" id="confirmBtn">Confirmar</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      let bsModal = new bootstrap.Modal(modal);
      bsModal.show();

      modal.querySelector('#confirmBtn').onclick = () => {
        bsModal.hide();
        setTimeout(() => modal.remove(), 500);
        onConfirm();
      };
      modal.addEventListener('hidden.bs.modal', () => modal.remove());
    }

    // Obtener usuarios actuales de la tabla
    function getUsers() {
      const rows = tableBody.querySelectorAll('tr');
      let users = [];
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 6) {
          users.push({
            name: cells[0].textContent,
            lastname: cells[1].textContent,
            birthdate: cells[2].textContent,
            email: cells[3].textContent,
            role: cells[4].textContent,
            startdate: cells[5].textContent
          });
        }
      });
      return users;
    }

    // Validaciones
    function validateForm(data, users) {
      // Todos los campos requeridos
      for (let key in data) {
        if (!data[key]) return 'Todos los campos son obligatorios.';
      }
      // Correo único
      if (users.some(u => u.email === data.email)) {
        return 'El correo ya está registrado. Por favor, ingrese uno diferente.';
      }
      // Fecha de ingreso >= nacimiento + 18 años
      let birth = new Date(data.birthdate);
      let minStart = new Date(birth.getFullYear() + 18, birth.getMonth(), birth.getDate());
      let start = new Date(data.startdate);
      if (start < minStart) {
        return 'La fecha de ingreso debe ser al menos 18 años después de la fecha de nacimiento.';
      }
      return null;
    }

    // Agregar fila a la tabla
    function addUserToTable(data) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${data.name}</td>
        <td>${data.lastname}</td>
        <td>${data.birthdate}</td>
        <td>${data.email}</td>
        <td>${data.role}</td>
        <td>${data.startdate}</td>
        <td><button class="btn btn-danger btn-sm btn-delete">Eliminar</button></td>
      `;
      tableBody.appendChild(tr);
    }

    // Manejar eliminación
    tableBody.addEventListener('click', function(e) {
      if (e.target.classList.contains('btn-delete')) {
        showModal('¿Seguro que deseas eliminar este usuario?', () => {
          e.target.closest('tr').remove();
        });
      }
    });

    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const data = {
        name: form.name.value.trim(),
        lastname: form.lastname.value.trim(),
        birthdate: form.birthdate.value,
        email: form.email.value.trim(),
        role: form.role.value,
        startdate: form.startdate.value
      };
      const users = getUsers();
      const error = validateForm(data, users);
      if (error) {
        showModal(error, () => {});
        return;
      }
      showModal('¿Deseas registrar este usuario?', () => {
        addUserToTable(data);
        form.reset();
      });
    });

    // Añadir columna de eliminar a las filas existentes
    [...tableBody.rows].forEach(row => {
      if (row.cells.length < 7) {
        let td = document.createElement('td');
        td.innerHTML = `<button class="btn btn-danger btn-sm btn-delete">Eliminar</button>`;
        row.appendChild(td);
      }
    });
  
  document.addEventListener('DOMContentLoaded', function() {
    // Utilidad para mostrar mensajes
    function showMessage(input, message, isValid) {
      let msg = input.parentElement.querySelector('.form-text');
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'form-text';
        input.parentElement.appendChild(msg);
      }
      msg.textContent = message;
      msg.style.color = isValid ? 'green' : 'red';
      input.classList.toggle('is-valid', isValid);
      input.classList.toggle('is-invalid', !isValid);
    }

    // Validaciones individuales
    function validateName(input) {
      if (input.value.trim().length < 2) {
        showMessage(input, 'Debe tener al menos 2 caracteres.', false);
        return false;
      }
      showMessage(input, 'Nombre válido.', true);
      return true;
    }

    function validateLastname(input) {
      if (input.value.trim().length < 2) {
        showMessage(input, 'Debe tener al menos 2 caracteres.', false);
        return false;
      }
      showMessage(input, 'Apellido válido.', true);
      return true;
    }

    function validateEmail(input) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(input.value.trim())) {
        showMessage(input, 'Correo inválido.', false);
        return false;
      }
      showMessage(input, 'Correo válido.', true);
      return true;
    }

    function validateBirthdate(input) {
      if (!input.value) {
        showMessage(input, 'Ingrese una fecha.', false);
        return false;
      }
      const date = new Date(input.value);
      const today = new Date();
      today.setHours(0,0,0,0); // Ignorar hora
      // Si la fecha es inválida o es hoy o en el futuro
      if (isNaN(date.getTime()) || date >= today) {
        showMessage(input, 'Fecha inválida.', false);
        return false;
      }
      // Calcular si tiene al menos 18 años
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 18);
      minDate.setHours(0,0,0,0);
      if (date > minDate) {
        showMessage(input, 'Debe ser mayor de 18 años.', false);
        return false;
      }
      showMessage(input, 'Fecha válida.', true);
      return true;
    }

    function validateStartdate(input) {
      if (!input.value) {
        showMessage(input, 'Ingrese una fecha.', false);
        return false;
      }
      showMessage(input, 'Fecha válida.', true);
      return true;
    }

    function validateRole(input) {
      if (!input.value) {
        showMessage(input, 'Seleccione un cargo.', false);
        return false;
      }
      showMessage(input, 'Cargo válido.', true);
      return true;
    }

    // Asignar eventos a los inputs
    const nameInput = document.getElementById('name');
    const lastnameInput = document.getElementById('lastname');
    const emailInput = document.getElementById('email');
    const birthdateInput = document.getElementById('birthdate');
    const startdateInput = document.getElementById('startdate');
    const roleInput = document.getElementById('role');

    nameInput.addEventListener('input', () => validateName(nameInput));
    lastnameInput.addEventListener('input', () => validateLastname(lastnameInput));
    emailInput.addEventListener('input', () => validateEmail(emailInput));
    birthdateInput.addEventListener('input', () => validateBirthdate(birthdateInput));
    startdateInput.addEventListener('input', () => validateStartdate(startdateInput));
    roleInput.addEventListener('change', () => validateRole(roleInput));

    // Validación al enviar el formulario
    document.querySelector('form').addEventListener('submit', function(e) {
      let valid = true;
      valid = validateName(nameInput) && valid;
      valid = validateLastname(lastnameInput) && valid;
      valid = validateEmail(emailInput) && valid;
      valid = validateBirthdate(birthdateInput) && valid;
      valid = validateStartdate(startdateInput) && valid;
      valid = validateRole(roleInput) && valid;
      if (!valid) {
        e.preventDefault();
      }
    });
  });
  