import { makeAutoObservable } from "mobx";
import SimilarJob from "../SimilarJob";

class JobDetail {
  similarJobs: SimilarJob[] = [];

  companyLogoUrl: string;
  companyWebsiteUrl: string;
  employmentType: string;
  id: string;
  jobDescription: string;
  lifeAtCompany: any;
  location: string;
  packagePerAnnum: string;
  rating: string;
  skills: any;
  title: string;

  constructor({ job_details, similar_jobs }: any) {
    const {
      company_logo_url,
      company_website_url,
      employment_type,
      id,
      job_description,
      life_at_company,
      location,
      package_per_annum,
      rating,
      skills,
      title,
    } = job_details;

    this.companyLogoUrl = company_logo_url;
    this.companyWebsiteUrl = company_website_url;
    this.id = id;
    this.employmentType = employment_type;
    this.jobDescription = job_description;
    this.lifeAtCompany = life_at_company;
    this.location = location;
    this.packagePerAnnum = package_per_annum;
    this.rating = rating;
    this.skills = skills;
    this.title = title;

    this.similarJobs = similar_jobs.map((sj: any) => new SimilarJob(sj));

    makeAutoObservable(this);
  }
}

export default JobDetail;

/*
company_logo_url
company_website_url
employment_type
id
job_description
life_at_company
location
package_per_annum
rating
skills
title



{
      company_logo_url,
      company_website_url,
      employment_type,
      id,
      job_description,
      life_at_company,
      location,
      package_per_annum,
      rating,
      skills,
      title,
    }

*/
