const { createClient } = supabase;

const supabaseClient = createClient(
  'https://mlzpgtjjpzqcljepbise.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1senBndGpqcHpxY2xqZXBiaXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzgzNjQsImV4cCI6MjA2ODQxNDM2NH0.0BGyl12E6ZU6qFFpSxWvvgc3AA9gXul6R2esTPa1iCg'
);

async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('error');

  if (!email || !password) {
    errorEl.textContent = "Please enter both email and password.";
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorEl.textContent = "Login failed: " + error.message;
    return;
  }

  errorEl.textContent = "";
  document.querySelector('h1').textContent = `Welcome, ${email}`;
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';

  alert("Login successful!");

  loadProperties();
}

async function loadProperties() {
  const { data, error } = await supabaseClient.from('Properties').select('*');

  const list = document.getElementById('propertyList');
  list.innerHTML = '';

  if (error) {
    list.innerHTML = `<li>Error loading properties: ${error.message}</li>`;
    return;
  }

  if (data.length === 0) {
    list.innerHTML = `<li>No properties found.</li>`;
    return;
  }

  data.forEach(prop => {
    const li = document.createElement('li');
    li.textContent = `${prop.address} – Rent: £${prop.rent}`;
    list.appendChild(li);
  });
}

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.reload();
}
