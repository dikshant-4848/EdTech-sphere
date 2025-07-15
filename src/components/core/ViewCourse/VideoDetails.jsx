import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
import { updateCompletedLectures } from "../../../slices/viewCourseSlice";
import { BigPlayButton, Player } from "video-react";
import "video-react/dist/video-react.css"; // Import CSS
import Spinner from "../../common/Spinner";
import { FaHeadphonesSimple } from "react-icons/fa6";
import { apiConnector } from "../../../services/apiConnector";
import { ratingsEndpoints } from "../../../services/apis";
import CourseReviewsSlider from "./CourseReviewsSlider";
import { RiMenuFold2Line } from "react-icons/ri";
import { PiStudent } from "react-icons/pi";

const VideoDetails = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { token } = useSelector((state) => state.auth);
  const { courseSectionData, completedLectures } = useSelector(
    (state) => state.viewCourse
  );

  const { courseId, sectionId, subSectionId } = useParams();
  const playerRef = useRef(null);

  const [videoData, setVideoData] = useState([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileType, setFileType] = useState("");
  const [maxView, setMaxView] = useState(false);

  const [reviews, setReviews] = useState([]);

  const fetchCourseReviews = async () => {
    const reviewData = await apiConnector(
      "GET",
      ratingsEndpoints.SPECIFIC_COURSE_REVIEW_API.replace(":courseId", courseId)
    );
    // console.log("Reviews coming as: ", reviewData);
    setReviews(reviewData?.data?.courseRatings?.ratingAndReviews);
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseReviews();
    }
  }, []);

  // console.log("Reviews for this course: ", reviews);

  useEffect(() => {
    const setVideoSpecificDetails = async () => {
      if (!courseSectionData.length) return;
      if (!courseId && !sectionId && !subSectionId) {
        navigate("/dashboard/enrolled-courses");
      } else {
        const filteredSection = courseSectionData.filter(
          (course) => course._id === sectionId
        );
        const filteredExactVideo = filteredSection?.[0].subSection.filter(
          (subSection) => subSection._id === subSectionId
        );

        const videoUrl = filteredExactVideo[0].videoUrl;
        const isGoogleDrive = videoUrl.includes("drive.google.com");
        const fileExtension = videoUrl.split(".").pop();

        // Determine file type based on the URL
        setFileType(
          isGoogleDrive ? "pdf" : fileExtension === "pdf" ? "pdf" : "video"
        );
        setVideoData(filteredExactVideo[0]);
        setVideoEnded(false);
      }
    };

    setVideoSpecificDetails();
  }, [courseSectionData, location.pathname]);

  const handleLectureCompletion = async () => {
    setLoading(true);
    const res = await markLectureAsComplete(
      { courseId: courseId, subSectionId: subSectionId },
      token
    );
    if (res) {
      dispatch(updateCompletedLectures(subSectionId));
    }
    setLoading(false);
  };

  // Function to get Google Drive preview link
  const getGoogleDrivePreviewLink = (url) => {
    const fileId = url.split("/d/")[1]?.split("/")[0];
    return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
  };

  const videoUrl = videoData?.videoUrl;
  const pdfUrl =
    fileType === "pdf" && videoUrl
      ? getGoogleDrivePreviewLink(videoUrl)
      : videoUrl;

  return (
    <div className="">
      {!videoData ? (
        <div>No video is available.</div>
      ) : (
        <div className="relative">
          {fileType === "video" ? (
            <Player
              ref={playerRef}
              aspectRatio={maxView ? "1:1" : "16:9"}
              playsInline
              onEnded={() => setVideoEnded(true)}
              src={videoUrl}
              className="relative"
            >
              <BigPlayButton position="center" />
              {/* Render when video ends */}
              {videoEnded && (
                <div className="absolute bg-gradient-to-t from-slate-950 to-transparent backdrop-blur-sm inset-0 z-[100] grid w-full h-full place-content-center font-inter">
                  {!completedLectures.includes(subSectionId) && (
                    <button
                      disabled={loading}
                      onClick={() => handleLectureCompletion()}
                      className="px-4 py-2 mx-auto text-lg font-semibold bg-teal-500 rounded-md text-slate-900 max-w-max hover:bg-cyan-500"
                    >
                      {!loading ? "Mark As Completed" : <Spinner />}
                    </button>
                  )}

                  <button
                    disabled={loading}
                    onClick={() => {
                      if (playerRef?.current) {
                        playerRef.current?.seek(0);
                        setVideoEnded(false);
                        playerRef.current?.play();
                      }
                    }}
                    className="px-4 py-2 mx-auto mt-10 text-lg font-semibold rounded-md bg-slate-600 text-slate-200 max-w-max"
                  >
                    Rewatch
                  </button>

                  {/* Navigation buttons can go here */}
                </div>
              )}
            </Player>
          ) : (
            <div className="w-fit relative mx-auto h-[90vh]">
              <iframe
                src={pdfUrl}
                className="md:w-auto w-11/12 h-full md:!aspect-square aspect-auto mx-auto border-none"
                title="PDF Viewer"
                style={{ backgroundColor: "##3e89fa" }}
              />
              <div
                onClick={() => navigate("/contact")}
                className="absolute top-0 right-0 flex flex-col items-center justify-center h-16 text-4xl sm:w-16 w-14 md:h-20 group- bg-slate-800 bg-opacity-70 backdrop-blur-lg rounded-bl-xl text-slate-400 "
              >
                <FaHeadphonesSimple />
              </div>
            </div>
          )}
        </div>
      )}
      <div className="flex mt-14 mb-4 text-[#95a9d8] flex-row items-center justify-start gap-x-4">
        <RiMenuFold2Line className="size-8" />
        <h1 className="md:px-2 md:text-3xl sm:text-2xl text-xl font-semibold">
          {videoData?.title}
        </h1>
      </div>
      <div className="mt-2 mb-4 w-full bg-slate-600 h-px" />
      <p className="pt-2 pb-6 md:px-4 lg:px-10 text-sm font-medium md:text-base text-slate-500 ">
        {videoData?.description}
      </p>
      <div className="md:w-10/12 w-[95%] mx-auto md:mt-24 mt-16 mb-32">
        <div className="flex flex-row items-center justify-start gap-x-4">
          <PiStudent className="text-2xl text-[#6071a8]" />
          <h2 className="text-lg text-[#6071a8] sm:text-xl md:text-2xl">
            Students Reviews in this Course
          </h2>
        </div>
        <div className="mt-2 mb-12 w-full bg-slate-600 h-px" />
        <CourseReviewsSlider Reviews={reviews} Id={"CourseReview"} />
      </div>
    </div>
  );
};

export default VideoDetails;
