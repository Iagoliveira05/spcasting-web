const errorMessages: Record<string, string> = {
  "auth/invalid-credential": "E-mail ou senha incorretos. Confira os dados e tente novamente.",
  "auth/invalid-email": "Informe um endereço de e-mail válido.",
  "auth/email-already-in-use": "Este e-mail já está cadastrado. Entre na conta ou use outro e-mail.",
  "auth/weak-password": "A senha é muito fraca. Use pelo menos 6 caracteres.",
  "auth/user-disabled": "Esta conta foi desativada. Entre em contato com o suporte.",
  "auth/too-many-requests": "Muitas tentativas foram feitas. Aguarde alguns minutos e tente novamente.",
  "auth/network-request-failed": "Não foi possível conectar. Verifique sua internet e tente novamente.",
  "auth/popup-closed-by-user": "A janela de acesso foi fechada antes da conclusão.",
  "auth/popup-blocked": "O navegador bloqueou a janela de acesso. Permita pop-ups e tente novamente.",
  "auth/account-exists-with-different-credential": "Já existe uma conta com este e-mail usando outra forma de acesso.",
  "auth/operation-not-allowed": "Esta forma de acesso não está disponível no momento.",
  "permission-denied": "Você não tem permissão para realizar esta ação.",
  "firestore/permission-denied": "Você não tem permissão para realizar esta ação.",
  "unauthenticated": "Sua sessão expirou. Entre novamente para continuar.",
  "firestore/unauthenticated": "Sua sessão expirou. Entre novamente para continuar.",
  "unavailable": "O serviço está temporariamente indisponível. Tente novamente em instantes.",
  "firestore/unavailable": "O serviço está temporariamente indisponível. Tente novamente em instantes.",
  "deadline-exceeded": "A operação demorou mais que o esperado. Tente novamente.",
  "firestore/deadline-exceeded": "A operação demorou mais que o esperado. Tente novamente.",
  "resource-exhausted": "O limite do serviço foi atingido. Tente novamente mais tarde.",
  "firestore/resource-exhausted": "O limite do serviço foi atingido. Tente novamente mais tarde.",
  "not-found": "O item solicitado não foi encontrado ou já foi removido.",
  "firestore/not-found": "O item solicitado não foi encontrado ou já foi removido.",
  "aborted": "Os dados foram alterados por outra pessoa. Atualize a página e tente novamente.",
  "firestore/aborted": "Os dados foram alterados por outra pessoa. Atualize a página e tente novamente.",
};

const userFacingPrefixes = [
  "A ",
  "Arquivo",
  "Complete",
  "Envie",
  "Este ",
  "Esta ",
  "Informe",
  "Não ",
  "O ",
  "Selecione",
  "Você ",
];

export function friendlyError(reason: unknown, fallback: string) {
  if (!reason || typeof reason !== "object") return fallback;

  const code = "code" in reason ? String(reason.code) : "";
  if (errorMessages[code]) return errorMessages[code];

  if (reason instanceof Error) {
    const message = reason.message.trim();
    if (userFacingPrefixes.some((prefix) => message.startsWith(prefix))) {
      return message;
    }
  }

  return fallback;
}
