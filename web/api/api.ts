export async function getControls() {
  const res = await fetch("/api/controls");
  return res.json();
}

export async function updateControls(newControls: any) {
  const res = await fetch("/api/controls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newControls),
  });
  return res.json();
}
