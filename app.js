// Initialize Supabase
const { createClient } = supabase;
const supabase = supabase.createClient(
  'https://mlzpgtjjpzqcljepbise.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1senBndGpqcHpxY2xqZXBiaXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzgzNjQsImV4cCI6MjA2ODQxNDM2NH0.0BGyl12E6ZU6qFFpSxWvvgc3AA9gXul6R2esTPa1iCg'
);

// Login function
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
  document.querySelector('h1').textContent = `Welcome`;
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';

  alert("Login successful!");

  loadProperties();
}

// Load properties for logged-in user
async function loadProperties() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('Properties')
    .select('*')
    .eq('user_id', user.id);

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

// Add property
document.getElementById('propertyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const address = document.getElementById('address').value.trim();
  const rent = parseFloat(document.getElementById('rent').value);
  const message = document.getElementById('formMessage');

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data, error } = await supabase.from('Properties').insert([{
    user_id: user.id,
    address,
    rent
  }]);

  if (error) {
    message.textContent = "Failed to add property: " + error.message;
    return;
  }

  message.textContent = "Property added!";
  document.getElementById('propertyForm').reset();
  loadProperties();
});

// Logout
async function logout() {
  await supabase.auth.signOut();
  window.location.reload();
}
