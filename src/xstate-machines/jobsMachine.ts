import { createMachine } from "xstate";

const jobsMachine = createMachine({
  id: "jobs-machine",
  type: "parallel",
  context: {
    jobsData: [],
    profileData: [],
    error: "",
    selectedEmpTypes: [],
    salaryRange: "",
  },
  states: {
    profile: {
      id: "profile",
      states: {},
    },
  },
});
