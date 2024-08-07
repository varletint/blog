import { Select, Spinner, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../componets/PostCard";

export default function Search() {
  const [sidebarData, setSideBarData] = useState({
    searchTerm: "",
    sort: "desc",
    category: "uncategorized",
  });
  console.log(sidebarData);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");
    const categoryFromUrl = urlParams.get("category");
    if (searchTermFromUrl || sortFromUrl || categoryFromUrl) {
      setSideBarData({
        ...sidebarData,
        searchTerm: searchTermFromUrl,
        sort: sortFromUrl,
        category: categoryFromUrl,
      });
    }

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/post/getposts?${searchQuery}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
        setLoading(false);
      }
      if (data.posts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    };
    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    if (e.target.id == "searchTerm") {
      setSideBarData({ ...sidebarData, searchTerm: e.target.value });
    }
    if (e.target.id === "sort") {
      const order = e.target.value || "desc";
      setSideBarData({ ...sidebarData, sort: order });
    }
    if (e.target.id === "category") {
      const category = e.target.value || "uncategorized";
      setSideBarData({ ...sidebarData, category });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    urlParams.set("category", sidebarData.category);

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const numOfPosts = posts.length;
    const startIndex = numOfPosts;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();
    const res = await fetch(`/api/post/getposts?${searchQuery}`);

    if (!res.ok) {
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setPosts([...posts, ...data.posts]);
      if (data.posts.length === 9) {
        setShowMore(true);
      } else {
        setShowMore(false);
      }
    }
  };

  return (
    <div className='flex flex-col md:flex-row'>
      <div
        className=' p-7 border-b md:border-r 
      md:min-h-screen border-gray-200 bg-gray-50'>
        <form onSubmit={handleSubmit} className=' flex flex-col gap-8'>
          <div className='flex items-center gap-2'>
            <label className=' whitespace-nowrap font-semibold'>
              {" "}
              Search Term:
            </label>
            <TextInput
              placeholder='search...'
              id='searchTerm'
              type='text'
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex items-center gap-2'>
            <label className='  font-semibold'> Sort:</label>
            <Select onChange={handleChange} value={sidebarData.sort} id='sort'>
              <option value='desc'>Latest</option>
              <option value='asc'>Oldest</option>
            </Select>
          </div>
          <div className='flex items-center gap-2'>
            <label className='  font-semibold'> Category:</label>
            <Select
              onChange={handleChange}
              value={sidebarData.category}
              id='category'>
              <option value='uncategorized'>Uncategory</option>
              <option value='reactjs'>Reactjs</option>
              <option value='html'>HTML</option>
            </Select>
          </div>
          <button className=' btn btn-long btn-rounded'> Apply Filters</button>
        </form>
      </div>
      <div className='w-full'>
        <h1 className=' text-gray-400 text-xl text-center sm:border-b p-3 border-gray-300 mt-5'>
          Search results
        </h1>
        <div className=' p-5 flex justify-center flex-wrap gap-4'>
          {!loading && posts.length === 0 && (
            <p className=' text-l text-gray-400'>No posts found.</p>
          )}{" "}
          {loading && (
            <div className=' flex justify-center w-full p-28'>
              <Spinner size={"xl"} color={"success"}></Spinner>
              {/* <p className='text-l text-gray-400 text-center'>Loading...</p> */}
            </div>
          )}{" "}
          {!loading &&
            posts &&
            posts.map((post) => <PostCard key={post._id} post={post} />)}
          {showMore && (
            <button
              className='text-xl text-teal-400 
            hover:underline p-7 w-full'
              onClick={handleShowMore}>
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
