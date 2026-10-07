export function createWhatsAppLink(
  phone: string,
  name: string,
  jobName: string,
) {
  let digits = phone.replace(/\D/g, "").replace(/^00/, "");
  if (digits.startsWith("55")) digits = digits.slice(2);
  digits = digits.replace(/^0+/, "");
  const internationalNumber = `55${digits}`;
  const message = `Olá, ${name}! Tudo bem? Aqui é da SPCasting. Estou entrando em contato sobre a vaga ${jobName}.`;
  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`;
}
