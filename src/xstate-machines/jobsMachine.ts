import { assign, createMachine } from "xstate";
import { apiStatus } from "../constants/xstateConstants";
import { JobType } from "../stores/Models/Job/types";
import { getFetchOptions } from "../utils/getFetchOptions";

const profileApiUrl = "https://apis.ccbp.in/profile";
const jobsApiUrl = (
  empTypes: string[],
  salaryRange: string,
  searchKey: string
) => {
  const queryParams = [];
  queryParams.push(`employment_type=${empTypes.join(",")}`);
  queryParams.push(`minimum_package=${salaryRange}`);
  queryParams.push(`search=${searchKey}`);

  const url = `https://apis.ccbp.in/jobs?${queryParams.join("&")}`;
  return url;
};

const fetchData = async (url: string) => {
  const options = getFetchOptions();
  const response = await fetch(url, options);
  const data = await response.json();
  if (response.ok) return Promise.resolve(data);
  throw new Error("something went wrong");
};

interface jobsMachineContext {
  jobsData: JobType[];
  profileData: any;
  error: string;
  selectedEmpTypes: string[];
  salaryRange: string;
  searchKey: string;
}
type jobsMachineEvent =
  | {
      type: "SUBMIT_SEARCH_KEY" | "CHANGE_EMP_TYPES" | "CHANGE_SALARY_RANGE";
      data: string;
    }
  | { type: "RETRY_PROFILE_API" | "RETRY_JOBS_API" };

export const jobsMachine = createMachine<jobsMachineContext, jobsMachineEvent>({
  id: "jobs-machine",
  type: "parallel",
  context: {
    jobsData: [],
    profileData: null,
    error: "",
    selectedEmpTypes: [],
    salaryRange: "",
    searchKey: "",
  },
  states: {
    profile: {
      id: "profile-block",
      initial: apiStatus.loading,
      states: {
        [apiStatus.loading]: {
          invoke: {
            id: "fetch-profile-data",
            src: () => fetchData(profileApiUrl),
            onDone: {
              target: apiStatus.success,
              actions: assign({
                profileData: (_ctx, event) => event.data.profile_details,
              }),
            },
            onError: {
              target: apiStatus.failure,
            },
          },
        },
        [apiStatus.success]: {},
        [apiStatus.failure]: {
          on: {
            RETRY_PROFILE_API: apiStatus.loading,
          },
        },
      },
    },
    jobs: {
      id: "jobs-block",
      initial: apiStatus.loading,
      states: {
        [apiStatus.loading]: {
          invoke: {
            id: "fetch-jobs-data",
            src: (ctx) =>
              fetchData(
                jobsApiUrl(ctx.selectedEmpTypes, ctx.salaryRange, ctx.searchKey)
              ),
            onDone: {
              target: apiStatus.success,
              actions: assign({ jobsData: (_ctx, event) => event.data.jobs }),
            },
            onError: {
              target: apiStatus.failure,
            },
          },
        },
        [apiStatus.success]: {
          on: {
            SUBMIT_SEARCH_KEY: {
              target: apiStatus.loading,
              actions: assign({
                searchKey: (_ctx, event: any) => event.data,
              }),
            },
            CHANGE_EMP_TYPES: {
              target: apiStatus.loading,
              actions: assign({
                selectedEmpTypes: (ctx, event) => {
                  const empType = event.data;
                  if (!ctx.selectedEmpTypes.includes(empType))
                    return [...ctx.selectedEmpTypes, empType];
                  return ctx.selectedEmpTypes.filter((emp) => emp !== empType);
                },
              }),
            },
            CHANGE_SALARY_RANGE: {
              target: apiStatus.loading,
              actions: assign({ salaryRange: (_ctx, event) => event.data }),
            },
          },
        },
        [apiStatus.failure]: {
          on: {
            RETRY_JOBS_API: apiStatus.loading,
          },
        },
      },
    },
  },
});
