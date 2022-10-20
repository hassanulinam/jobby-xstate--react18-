import { action, flow, makeAutoObservable } from "mobx";
import apiConst from "../../../constants/apiConst";
import { getFetchOptions } from "../../../utils/getFetchOptions";
import makeAsyncCall from "../../../utils/makeAsyncCall";
import JobDetail from "../JobDetail";

class Job {
  id: string;
  title: string;
  rating: string;
  location: string;
  companyLogoUrl: string;
  employmentType: string;
  jobDescription: string;
  packagePerAnnum: string;

  jobDetails: JobDetail | null = null;
  jobDetailsApi = apiConst.initial;
  apiErrors: any = null;

  constructor({
    id,
    title,
    rating,
    location,
    company_logo_url,
    employment_type,
    job_description,
    package_per_annum,
  }: any) {
    this.id = id;
    this.title = title;
    this.rating = rating;
    this.location = location;
    this.companyLogoUrl = company_logo_url;
    this.employmentType = employment_type;
    this.jobDescription = job_description;
    this.packagePerAnnum = package_per_annum;

    makeAutoObservable(this, {
      getJobDetails: flow.bound,
      setJobDetailsData: action.bound,
      setApiStatus: action.bound,
      onJobDetailsApiFailure: action.bound,
      onJobDetailsApiSuccess: action.bound,
    });
  }

  // ======== JobDetails api ==============
  setApiStatus(status: string) {
    this.jobDetailsApi = status;
  }

  setJobDetailsData(data: any) {
    this.jobDetails = new JobDetail(data);
  }

  onJobDetailsApiSuccess(data: any) {
    this.setJobDetailsData(data);
    this.setApiStatus(apiConst.success);
  }

  onJobDetailsApiFailure(err: any) {
    this.setApiStatus(apiConst.failure);
  }

  *getJobDetails() {
    this.setApiStatus(apiConst.inProgress);
    const url = `https://apis.ccbp.in/jobs/${this.id}`;
    const options = getFetchOptions();
    yield makeAsyncCall(
      { url, options },
      this.onJobDetailsApiSuccess,
      this.onJobDetailsApiFailure
    );
  }
}

export default Job;
