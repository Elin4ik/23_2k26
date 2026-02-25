export async function registerUser(name: string): Promise<{
  hero: string;
  already_assigned: boolean;
  name: string;
}> {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Ошибка сервера");
  }

  return response.json();
}

export async function getStatus(): Promise<{
  total: number;
  assigned: number;
  remaining: number;
}> {
  const response = await fetch("/api/status");
  if (!response.ok) throw new Error("Ошибка получения статуса");
  return response.json();
}


