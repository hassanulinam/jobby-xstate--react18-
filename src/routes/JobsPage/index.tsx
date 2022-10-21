/* eslint-disable react-hooks/exhaustive-deps */
import { ThreeDots } from "react-loader-spinner";
import { employmentTypes, salaryRanges } from "../../constants/filtersData";
import { BsSearch } from "react-icons/bs";
import { useState } from "react";
import "./index.css";
import FailureView from "../../components/FailureView";
import Header from "../../components/Header";
import JobItem from "../../components/JobItem";
import { useMachine } from "@xstate/react";
import { jobsMachine } from "../../xstate-machines/jobsMachine";
import { apiStatus } from "../../constants/xstateConstants";
import { JobType } from "../../stores/Models/Job/types";

const Jobs = () => {
  const [jobsState, send] = useMachine(jobsMachine);
  const [searchKey, setSearchKey] = useState("");

  const onChangeSalaryRange = (e: React.ChangeEvent<HTMLInputElement>) => {
    send({ type: "CHANGE_SALARY_RANGE", data: e.target.value.toString() });
  };

  const renderJobTypeFilters = () => {
    return (
      <ul>
        {employmentTypes.map((item) => (
          <li className="filter-input-container" key={item.employmentTypeId}>
            <input
              type="checkbox"
              id={item.employmentTypeId}
              onChange={(e: any) =>
                send({ type: "CHANGE_EMP_TYPES", data: e.target.id })
              }
            />
            <label htmlFor={item.employmentTypeId}>{item.label}</label>
          </li>
        ))}
      </ul>
    );
  };

  const renderSalaryRangeFilters = () => {
    return (
      <ul>
        {salaryRanges.map((item) => (
          <li className="filter-input-container" key={item.salaryRangeId}>
            <input
              type="radio"
              id={item.salaryRangeId}
              value={item.salaryRangeId}
              name="salaryRange"
              onChange={onChangeSalaryRange}
            />
            <label htmlFor={item.salaryRangeId}>{item.label}</label>
          </li>
        ))}
      </ul>
    );
  };

  const renderLoadingView = () => (
    <div className="loader-container">
      <ThreeDots color="#ffffff" height="80" width="80" />
    </div>
  );

  const renderSearchBar = () => {
    return (
      <div className="search-bar-container">
        <input
          type="search"
          value={searchKey}
          placeholder="Search"
          onChange={(e) => setSearchKey(e.target.value)}
          className="search-input"
        />
        <button
          type="button"
          onClick={() => {
            send({ type: "SUBMIT_SEARCH_KEY", data: searchKey });
          }}
          className="search-btn"
        >
          <BsSearch className="search-icon" color="#ffffff" size="20" />
        </button>
      </div>
    );
  };

  const renderJobResultsView = () => {
    const { jobsData } = jobsState.context;
    if (jobsData.length > 0)
      return (
        <ul className="job-cards-container">
          {jobsData.map((item: JobType) => (
            <JobItem key={item.id} details={item} />
          ))}
        </ul>
      );
    return (
      <div className="no-jobs-view-card">
        <img
          alt="no jobs"
          src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
          className="no-jobs-img"
        />
        <h1>No Jobs Found</h1>
        <p>We could not find any Jobs. Try other filters.</p>
      </div>
    );
  };

  const renderResultsViewBasedOnApiStatus = () => {
    const matchesJobsApiStatus = (givenState: string) =>
      jobsState.matches({ jobs: givenState });

    if (matchesJobsApiStatus(apiStatus.success)) return renderJobResultsView();
    if (matchesJobsApiStatus(apiStatus.failure))
      return <FailureView retryMethod={() => send("RETRY_JOBS_API")} />;
    if (matchesJobsApiStatus(apiStatus.loading))
      return <div className="loader-view-wrapper">{renderLoadingView()}</div>;
  };

  const renderProfileCard = () => {
    const { profileData } = jobsState.context;

    const matchesProfileState = (givenState: string) =>
      jobsState.matches({ profile: givenState });

    if (matchesProfileState(apiStatus.success))
      return (
        <div className="profile-card-wrapper">
          <div className="profile-card-container">
            <img
              src={profileData?.profile_image_url}
              alt="profile"
              className="profile-img"
            />
            <h1 className="profile-heading">{profileData?.name}</h1>
            <p className="profile-text">{profileData?.short_bio}</p>
          </div>
        </div>
      );
    if (matchesProfileState(apiStatus.failure))
      return (
        <div className="profile-card-wrapper">
          <button
            type="button"
            className="retry-btn"
            onClick={() => {
              send({ type: "RETRY_PROFILE_API" });
            }}
          >
            Retry
          </button>
        </div>
      );
    if (matchesProfileState(apiStatus.loading))
      return <div className="profile-card-wrapper">{renderLoadingView()}</div>;
  };

  const renderProfileAndFiltersContainer = () => (
    <div className="profile-and-filters-container mb-2">
      {renderProfileCard()}
      <hr />
      <div className="jobs-filters-container">
        <h1 className="filters-heading">Type of Employment</h1>
        {renderJobTypeFilters()}
      </div>
      <hr />
      <div className="salary-range-filters-container">
        <h1 className="filters-heading">Salary Range</h1>
        {renderSalaryRangeFilters()}
      </div>
    </div>
  );

  return (
    <div className="jobs-route-container">
      <Header />
      <div className="jobs-route-contents">
        {renderProfileAndFiltersContainer()}
        <div className="jobs-page-container">
          <div className="job-results-container">
            <div>{renderSearchBar()}</div>
            {renderResultsViewBasedOnApiStatus()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
