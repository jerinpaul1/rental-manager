const supabase = supabase.createClient(
  'https://mlzpgtjjpzqcljepbise.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1senBndGpqcHpxY2xqZXBiaXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzgzNjQsImV4cCI6MjA2ODQxNDM2NH0.0BGyl12E6ZU6qFFpSxWvvgc3AA9gXul6R2esTPa1iCg'
);

async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('error');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    errorEl.textContent = error.message;
    return;
  }

  errorEl.textContent = '';
  document.querySelector('h1').textContent = `Welcome, ${email}`;
  document.getElementById('dashboard').style.display = 'block';
  loadProperties();
}

async function loadProperties() {
  const { data, error } = await supabase.from('Properties').select('*');

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
  await supabase.auth.signOut();
  window.location.reload();
}
