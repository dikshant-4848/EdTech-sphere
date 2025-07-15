import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import ReactStars from "react-rating-stars-component";
import { apiConnector } from "../../services/apiConnector";
import { ratingsEndpoints } from "../../services/apis";

const ReviewSlider = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const truncateWords = 15;

  useEffect(() => {
    const fetchAllReviews = async () => {
      setLoading(true);
      const reviewData = await apiConnector(
        "GET",
        ratingsEndpoints.REVIEWS_DETAILS_API
      );
      if (reviewData?.data?.success) {
        setReviews(reviewData?.data?.allRatings?.data);
      }
      setLoading(false);
    };
    fetchAllReviews();
  }, []);

  return (
    <div className="text-white">
      <div className="h-[190px] max-w-maxContentTab lg:max-w-maxContent mt-7 mb-14">
        <Swiper
          slidesPerView={4}
          spaceBetween={24}
          loop={true}
          freeMode={true}
          grabCursor={true}
          speed={1500}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          modules={[FreeMode, Autoplay]}
          className="w-full "
        >
          {loading
            ? Array(8)
                .fill(null)
                .map((_, index) => (
                  <SwiperSlide key={index} className="min-h-[220px] md:h-auto">
                    <ShimmerReviewCard />
                  </SwiperSlide>
                ))
            : reviews.map((review, index) => (
                <SwiperSlide key={index} className="h-[220px] md:h-auto">
                  <div className="flex flex-col md:gap-3 gap-1 p-3 text-sm rounded-lg bg-gradient-to-br from-[#1c233b] to-[#28344d] text-slate-200 h-full">
                    <div className="flex items-center gap-1 md:gap-4">
                      <img
                        src={
                          review?.user?.image
                            ? review?.user?.image
                            : `https://api.dicebear.com/5.x/initials/svg?seed=${review?.user?.firstName} ${review?.user?.lastName}`
                        }
                        alt="User"
                        className="object-cover w-5 rounded-full md:w-9 aspect-square"
                      />
                      <div className="flex flex-col px-2 w-[80%]">
                        <h1 className="overflow-hidden text-[12px] font-semibold text-slate-300 text-nowrap text-ellipsis md:text-base">
                          {review?.user?.firstName} {review?.user?.lastName}
                        </h1>
                        <h2 className="overflow-hidden text-nowrap text-ellipsis md:text-[12px] text-[10px] font-medium text-[#768ecf]">
                          {review?.course?.courseName}
                        </h2>
                      </div>
                    </div>
                    <p className="font-medium md:text-sm text-[10px] text-slate-400">
                      {review?.review?.split(" ").length > truncateWords
                        ? `${review?.review
                            ?.split(" ")
                            .slice(0, truncateWords)
                            .join(" ")} ...`
                        : `${review?.review}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-teal-500 md:text-base">
                        {review?.rating.toFixed(1)}
                      </h3>
                      <ReactStars
                        count={5}
                        value={review?.rating}
                        size={18}
                        edit={false}
                        activeColor={"#14e0b1"}
                        emptyIcon={<FaStar />}
                        fullIcon={<FaStar />}
                        color={"#798fba"}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
        </Swiper>
      </div>
    </div>
  );
};

// Shimmer component
const ShimmerReviewCard = () => {
  return (
    <div className="w-full flex flex-col md:gap-3 gap-1 p-3 text-sm rounded-lg bg-gradient-to-br from-[#1c233b] to-[#28344d] text-slate-200 h-full animate-pulse">
      <div className="flex items-center gap-1 md:gap-4">
        <div className="w-5 h-5 bg-teal-500 rounded-full shadow-md shadow-slate-950 md:w-9 md:h-9"></div>
        <div className="flex flex-col px-2 w-[80%]">
          <div className="w-2/3 h-4 rounded-md shadow-md bg-slate-600 shadow-slate-950"></div>
          <div className="w-1/2 h-2 mt-1 rounded-sm shadow-md shadow-slate-950 bg-slate-700"></div>
        </div>
      </div>
      <div className="w-full h-5 mt-2 rounded-sm shadow-md shadow-slate-950 bg-slate-600"></div>
      {/* <div className="w-4/5 h-3 mt-1 rounded-md bg-slate-600"></div> */}
      <div className="w-3/4 h-3 mt-1 rounded-sm bg-slate-600"></div>
      <div className="flex items-center gap-2 mt-2">
        <div className="w-4 h-4 bg-teal-500 rounded"></div>
        <div className="w-2/3 h-4 rounded shadow-md bg-slate-500 shadow-slate-950"></div>
      </div>
    </div>
  );
};

export default ReviewSlider;
