import React from "react";
export type AuthMode = "register" | "login";
type Props = {
    mode: AuthMode;
    onClose: () => void;
};
declare const AuthModal: React.FC<Props>;
export default AuthModal;
//# sourceMappingURL=AuthModal.d.ts.map