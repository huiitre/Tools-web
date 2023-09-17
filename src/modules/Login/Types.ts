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

export interface SubscriptionData {
  email: {
    value: string;
  };
  name: {
    value: string;
  };
  password: {
    value: string;
    showPassword: boolean;
  };
  confirmPassword: {
    value: string;
    showPassword: boolean;
  }
}