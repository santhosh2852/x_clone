import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { POSTS } from "../../utils/db/dummy";
import { BASE_URL } from "../constant/url";
import { useQuery } from '@tanstack/react-query';
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
	// const isLoading = false;
	const getPostEndPoint = () => {
		switch (feedType) {
			case "forYou":
				return `${BASE_URL}/api/posts/all`;
			case "following":
				return `${BASE_URL}/api/posts/following`;
			case "posts":
				return `${BASE_URL}/api/posts/user/${username}`;
			case "likes":
				return `${BASE_URL}/api/posts/likes/${userId}`;
			default:
				return `${BASE_URL}/api/posts/all`;
		}
	}
	const POST_ENDPOINT = getPostEndPoint();

	const { data: posts, isLoading, refetch, isRefetching, error } = useQuery({
		queryKey: ['posts', feedType, username, userId],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT, {
					method: 'GET',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					}
				})
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || 'Failed to fetch posts');
				}
				return data;
			} catch (error) {
				throw error;
			}
		}
	})

	useEffect(() => {
		if ((feedType === 'posts' && username) || (feedType === 'likes' && userId) || (feedType === 'forYou' || feedType === 'following')) {
			refetch();
		}
	}, [feedType, username, userId, refetch])
	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{error && <p className='text-center my-4 text-red-500'>Error loading posts: {error.message}</p>}
			{!isLoading && !error && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !error && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;