import { flow, makeAutoObservable } from "mobx";
import apiConst from "../../constants/apiConst";
import { getFetchOptions } from "../../utils/getFetchOptions";
import makeAsyncCall from "../../utils/makeAsyncCall";
import Job from "../Models/Job";
import ProfileDataModel from "../Models/ProfileData";

class JobStore {
  jobsApiStatus = apiConst.initial;
  profileApiStatus = apiConst.initial;
  jobsData: Job[] = [];
  profileData: ProfileDataModel | null = null;
  selectedEmpTypes: string[] = [];
  salaryRange = "";
  searchKey = "";
  apiErrors: any = null;

  constructor() {
    makeAutoObservable(
      this,
      { getProfileData: flow.bound, getJobsData: flow.bound },
      { autoBind: true }
    );
  }

  // ========== Jobs api ===================
  setJobsApiStatus(status: string) {
    this.jobsApiStatus = status;
  }

  setJobsData(data: any) {
    this.jobsData = data.jobs.map((j: any) => new Job(j));
  }

  onJobsApiSuccess(data: any) {
    this.setJobsData(data);
    this.setJobsApiStatus(apiConst.success);
  }

  onJobsApiFailure(err: any) {
    this.apiErrors = err.message;
    this.setJobsApiStatus(apiConst.failure);
  }

  *getJobsData() {
    this.setJobsApiStatus(apiConst.inProgress);
    const { selectedEmpTypes, salaryRange, searchKey } = this;
    const queryParams = [];
    queryParams.push(`employment_type=${selectedEmpTypes.join(",")}`);
    queryParams.push(`minimum_package=${salaryRange}`);
    queryParams.push(`search=${searchKey}`);

    const url = `https://apis.ccbp.in/jobs?${queryParams.join("&")}`;
    const options = getFetchOptions();

    yield makeAsyncCall(
      { url, options },
      this.onJobsApiSuccess,
      this.onJobsApiFailure
    );
  }

  // ======== Profile api ==============
  setProfileApiStatus(status: string) {
    this.profileApiStatus = status;
  }

  setProfileData(data: any) {
    this.profileData = new ProfileDataModel(
      data.profile_details.name,
      data.profile_details.profile_image_url,
      data.profile_details.short_bio
    );
  }

  onProfileApiSuccess(data: any) {
    this.setProfileData(data);
    this.setProfileApiStatus(apiConst.success);
  }

  onProfileApiFailure(err: any) {
    this.apiErrors = err.message;
    this.setProfileApiStatus(apiConst.failure);
  }

  *getProfileData() {
    this.setProfileApiStatus(apiConst.inProgress);
    const options = getFetchOptions();
    const url = "https://apis.ccbp.in/profile";

    yield makeAsyncCall(
      { url, options },
      this.onProfileApiSuccess,
      this.onProfileApiFailure
    );
  }

  //=================

  addOrRemoveJobTypeFilters(jobType: string) {
    if (this.selectedEmpTypes.includes(jobType)) {
      this.selectedEmpTypes = this.selectedEmpTypes.filter(
        (j) => jobType !== j
      );
    } else this.selectedEmpTypes.push(jobType);
  }

  resetStore() {
    this.jobsApiStatus = apiConst.initial;
    this.profileApiStatus = apiConst.initial;
    this.jobsData = [];
    this.profileData = null;
    this.selectedEmpTypes = [];
    this.salaryRange = "";
    this.searchKey = "";
    this.apiErrors = null;
  }
}

export default JobStore;
