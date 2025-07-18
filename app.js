const SUPABASE_URL = "https://mlzpgtjjpzqcljepbise.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1senBndGpqcHpxY2xqZXBiaXNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MzgzNjQsImV4cCI6MjA2ODQxNDM2NH0.0BGyl12E6ZU6qFFpSxWvvgc3AA9gXul6R2esTPa1iCg";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    document.getElementById("auth-error").innerText = error.message;
  } else {
    loadDashboard();
  }
}

async function logout() {
  await supabase.auth.signOut();
  location.reload();
}

async function loadDashboard() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  document.getElementById("auth-section").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  // Load properties
  const { data, error } = await supabase
    .from("Properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return console.error(error);

  const list = document.getElementById("property-list");
  list.innerHTML = "";
  data.forEach(p => {
    const item = document.createElement("div");
    item.innerText = `${p.address} (£${p.monthly_rent})`;
    list.appendChild(item);
  });
}

async function addProperty() {
  const address = document.getElementById("new-address").value;
  const rent = parseFloat(document.getElementById("new-rent").value);

  const { data: user } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("Properties").insert({
    user_id: user.user.id,
    address: address,
    monthly_rent: rent
  });

  if (error) {
    document.getElementById("add-msg").innerText = error.message;
  } else {
    document.getElementById("add-msg").innerText = "Property added!";
    document.getElementById("new-address").value = "";
    document.getElementById("new-rent").value = "";
    loadDashboard();
  }
}

loadDashboard();
