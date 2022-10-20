import { assign, createMachine } from "xstate";
import { setAccessToken } from "../utils/accessToken";

const fetchOptions = (formData: string) => ({
  method: "POST",
  body: formData,
});

const url = "https://apis.ccbp.in/login";
const onSubmitForm = async (options: any) => {
  const response = await fetch(url, options);
  const data: any = await response.json();
  console.log("[login POST]", data);
  if (response.ok) {
    return Promise.resolve(data);
  } else {
    throw new Error(data.error_msg);
  }
};

interface authMachineContext {
  error: string;
  formData: string;
}

type authMachineEvent = {
  type: "SUBMIT";
  formData: { username: string; password: string };
};

export const authMachine = createMachine<authMachineContext, authMachineEvent>({
  id: "authMachine",
  initial: "idle",
  context: {
    error: "",
    formData: JSON.stringify({ username: "", password: "" }),
  },
  states: {
    idle: {
      on: {
        SUBMIT: {
          target: "submittingForm",
          actions: assign({
            formData: (_, event: any) => JSON.stringify(event.formData),
          }),
        },
      },
    },

    submittingForm: {
      invoke: {
        id: "submitting-form",
        src: (ctx, _event) => onSubmitForm(fetchOptions(ctx.formData)),
        onDone: {
          target: "loginSuccess",
          actions: (_ctx, response) => {
            setAccessToken(response.data.jwt_token);
          },
        },
        onError: {
          target: "loginFailure",
          actions: assign({ error: (_ctx, error) => error.data.message }),
        },
      },
    },

    loginFailure: {
      on: {
        SUBMIT: {
          target: "submittingForm",
          actions: assign({
            formData: (_, event: any) => JSON.stringify(event.value),
          }),
        },
      },
    },

    loginSuccess: {
      type: "final",
    },
  },
});
