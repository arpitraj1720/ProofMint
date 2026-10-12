export type Page =
  | "home"
  | "verify"
  | "login"
  | "register-account"
  | "dashboard"
  | "register"
  | "profile"
  | "about";

export type RegisterStep = "idle" | "uploading" | "hashing" | "registering" | "done";
export type VerifyStep = "idle" | "checking" | "done";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          initCodeClient: (config: any) => any;
        };
      };
    };
  }
}
