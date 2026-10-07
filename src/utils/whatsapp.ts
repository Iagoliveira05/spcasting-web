export function createWhatsAppLink(
  phone: string,
  name: string,
  jobName: string,
) {
  const digits = phone.replace(/\D/g, "");
  const internationalNumber = digits.startsWith("55") ? digits : `55${digits}`;
  const message = `Olá, ${name}! Tudo bem? Aqui é da SPCasting. Estou entrando em contato sobre a vaga ${jobName}.`;
  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`;
}
