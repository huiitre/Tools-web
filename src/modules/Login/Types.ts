export interface ConnexionData {
  email: {
    value: string;
    isError: boolean;
    isErrorMessage: string;
  };
  password: {
    value: string;
    isError: boolean;
    isErrorMessage: string;
    showPassword: boolean;
  };
}