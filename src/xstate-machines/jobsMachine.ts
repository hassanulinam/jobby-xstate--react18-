import { createMachine } from "xstate";
import Job from "../stores/Models/Job";
import ProfileDataModel from "../stores/Models/ProfileData";
import { getFetchOptions } from "../utils/getFetchOptions";

const getProfileData = async () => {
  const url = "https://apis.ccbp.in/profile";
  const options = getFetchOptions();
  const response = await fetch(url, options);
  const data = await response.json();
  console.log("[profile fetch]:", data);
  return Promise.resolve(data);
};

interface jobsMachineContext {
  jobsData: Job[];
  profileData: ProfileDataModel | null;
  error: string;
  selectedEmpTypes: string[];
  salaryRange: string;
}

export const jobsMachine = createMachine<jobsMachineContext>({
  id: "jobs-machine",
  type: "parallel",
  context: {
    jobsData: [],
    profileData: null,
    error: "",
    selectedEmpTypes: [],
    salaryRange: "",
  },
  states: {
    profile: {
      id: "profile-block",
      initial: "apiLoading",
      states: {
        apiLoading: {
          invoke: {
            id: "fetch-profile-data",
            src: () => getProfileData(),
            onDone: {
              target: "apiSuccess",
            },
            onError: {
              target: "apiFailure",
            },
          },
        },
        apiSuccess: {},
        apiFailure: {
          on: {
            RETRY: "apiLoading",
          },
        },
      },
    },
    jobs: {
      id: "jobs-block",
      states: {},
    },
  },
});
