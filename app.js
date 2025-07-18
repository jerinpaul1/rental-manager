// Initialize Supabase client
const { createClient } = supabase;

const supabaseClient = createClient(
  'https://mlzpgtjjpzqcljepbise.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1senBndGpqcHpxY2xqZXBiaXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzgzNjQsImV4cCI6MjA2ODQxNDM2NH0.0BGyl12E6ZU6qFFpSxWvvgc3AA9gXul6R2esTPa1iCg'
);

// Login function
async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('error');
  errorEl.textContent = "";

  if (!email || !password) {
    errorEl.textContent = "Please enter both email and password.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    errorEl.textContent = "Login failed: " + error.message;
    return;
  }

  document.querySelector('h1').textContent = `Welcome, ${email}`;
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  alert("Login successful!");

  loadProperties();
}

// Load user-specific properties and related tenants
async function loadProperties() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  const { data: properties, error } = await supabaseClient
    .from('Properties')
    .select('*')
    .eq('user_id', user.id);

  const list = document.getElementById('propertyList');
  list.innerHTML = '';

  if (error) {
    list.innerHTML = `<li>Error loading properties: ${error.message}</li>`;
    return;
  }

  if (properties.length === 0) {
    list.innerHTML = `<li>No properties found.</li>`;
    return;
  }

  const template = document.getElementById('propertyTemplate');

  for (const prop of properties) {
    const clone = template.content.cloneNode(true);
    clone.querySelector('.property-address').textContent = prop.address;
    clone.querySelector('.property-rent').textContent = prop.monthly_rent;

    const tenantList = clone.querySelector('.tenant-list');
    const tenantForm = clone.querySelector('.tenant-form');

    // Load tenants by property_id only
    const { data: tenants, error: tenantError } = await supabaseClient
      .from('Tenants')
      .select('*')
      .eq('property_id', prop.id);

    tenantList.innerHTML = '';

    if (tenantError) {
      tenantList.innerHTML = `<li>Error loading tenants: ${tenantError.message}</li>`;
    } else if (!tenants || tenants.length === 0) {
      tenantList.innerHTML = '<li>No tenants added.</li>';
    } else {
      tenants.forEach(tenant => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${tenant.name}</strong> (${tenant.phone}, ${tenant.email})<br>
          Move-in: ${tenant.move_in_date || 'N/A'}<br>
          Move-out: ${tenant.move_out_date || 'N/A'}
        `;

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Remove';
        delBtn.style.marginLeft = '10px';
        delBtn.onclick = async () => {
          const { error } = await supabaseClient
            .from('Tenants')
            .delete()
            .eq('id', tenant.id);
          if (error) {
            alert('Failed to remove tenant: ' + error.message);
          } else {
            loadProperties();
          }
        };

        li.appendChild(delBtn);
        tenantList.appendChild(li);
      });
    }

    // Add new tenant
    tenantForm.onsubmit = async (e) => {
      e.preventDefault();

      const formData = new FormData(tenantForm);
      const name = formData.get('name');
      const phone = formData.get('phone');
      const email = formData.get('email');
      const move_in_date = formData.get('move_in_date');
      const move_out_date = formData.get('move_out_date');

      const { error } = await supabaseClient.from('Tenants').insert([{
        property_id: prop.id,
        name,
        phone,
        email,
        move_in_date,
        move_out_date
      }]);

      if (error) {
        alert("Failed to add tenant: " + error.message);
      } else {
        tenantForm.reset();
        loadProperties();
      }
    };

    list.appendChild(clone);
  }
}

// Add a new property
document.getElementById('propertyForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const address = document.getElementById('address').value.trim();
  const rent = parseFloat(document.getElementById('monthly_rent').value);
  const message = document.getElementById('formMessage');

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    message.textContent = "Please login first.";
    return;
  }

  const { error } = await supabaseClient.from('Properties').insert([
    {
      user_id: user.id,
      address,
      monthly_rent: rent
    }
  ]);

  if (error) {
    message.textContent = "Failed to add property: " + error.message;
    return;
  }

  message.textContent = "Property added successfully!";
  document.getElementById('propertyForm').reset();
  loadProperties();
});

// Logout
async function logout() {
  await supabaseClient.auth.signOut();
  window.location.reload();
}
