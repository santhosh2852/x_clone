import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../components/constant/url";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { MdEdit } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { FaLink } from "react-icons/fa";

const EditProfileModal = () => {
	// const queryClient = useQueryClient();
	const { data: authUser } = useQuery({
		queryKey: ["authUser"],
	});

	const [formData, setFormData] = useState({
		fullName: "",
		username: "",
		email: "",
		bio: "",
		link: "",
		currentPassword: "",
		newPassword: "",
	});
	const queryClient = useQueryClient();

	useEffect(() => {
		if (authUser) {
			setFormData({
				fullName: authUser.fullName || "",
				username: authUser.username || "",
				email: authUser.email || "",
				bio: authUser.bio || "",
				link: authUser.link || "",
				currentPassword: "",
				newPassword: "",
			});
		}
	}, [authUser]);

	const { mutateAsync: updateUser, isPending } = useMutation({
		mutationFn: async (data) => {
			try {
				const res = await fetch(`${BASE_URL}/api/users/update`, {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});

				const responseData = await res.json();
				if (!res.ok) {
					throw new Error(responseData.error || "Failed to update profile");
				}
				return responseData;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: async (data) => {
			toast.success("Profile updated successfully");
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
			]);
			document.getElementById("edit_profile_modal").close();
			// Reset password fields
			setFormData((prev) => ({
				...prev,
				currentPassword: "",
				newPassword: "",
			}));
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update profile");
		},
	});

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		// Validate fullName is not empty
		if (!formData.fullName || !formData.fullName.trim()) {
			toast.error("Full Name is required");
			return;
		}

		// Only include fields that should be sent to backend
		const updateData = {
			fullName: formData.fullName.trim(),
			username: formData.username.trim(),
			email: formData.email.trim(),
			bio: formData.bio,
			link: formData.link,
		};

		// Only include password fields if they are filled
		if (formData.currentPassword || formData.newPassword) {
			updateData.currentPassword = formData.currentPassword;
			updateData.newPassword = formData.newPassword;
		}

		updateUser(updateData);
	};

	return (
		<>
			<button
				className='btn btn-outline rounded-full btn-sm'
				onClick={() => document.getElementById("edit_profile_modal").showModal()}
			>
				<MdEdit className='w-4 h-4' />
				Edit profile
			</button>
			<dialog id='edit_profile_modal' className='modal border-none outline-none'>
				<div className='modal-box rounded border border-gray-600 max-w-2xl'>
					<h3 className='font-bold text-lg mb-4'>Edit Profile</h3>
					<form className='flex flex-col gap-4' onSubmit={handleSubmit}>
						<label className='input input-bordered rounded flex items-center gap-2'>
							<MdDriveFileRenameOutline />
							<input
								type='text'
								className='grow'
								placeholder='Full Name'
								name='fullName'
								value={formData.fullName}
								onChange={handleInputChange}
							/>
						</label>

						<label className='input input-bordered rounded flex items-center gap-2'>
							<FaUser />
							<input
								type='text'
								className='grow'
								placeholder='Username'
								name='username'
								value={formData.username}
								onChange={handleInputChange}
							/>
						</label>

						<label className='input input-bordered rounded flex items-center gap-2'>
							<MdOutlineMail />
							<input
								type='email'
								className='grow'
								placeholder='Email'
								name='email'
								value={formData.email}
								onChange={handleInputChange}
							/>
						</label>

						<textarea
							className='textarea textarea-bordered rounded resize-none'
							placeholder='Bio'
							name='bio'
							value={formData.bio}
							onChange={handleInputChange}
							rows={3}
						/>

						<label className='input input-bordered rounded flex items-center gap-2'>
							<FaLink />
							<input
								type='text'
								className='grow'
								placeholder='Link (e.g., https://example.com)'
								name='link'
								value={formData.link}
								onChange={handleInputChange}
							/>
						</label>

						<div className='divider'>Change Password (Optional)</div>

						<label className='input input-bordered rounded flex items-center gap-2'>
							<MdPassword />
							<input
								type='password'
								className='grow'
								placeholder='Current Password'
								name='currentPassword'
								value={formData.currentPassword}
								onChange={handleInputChange}
							/>
						</label>

						<label className='input input-bordered rounded flex items-center gap-2'>
							<MdPassword />
							<input
								type='password'
								className='grow'
								placeholder='New Password'
								name='newPassword'
								value={formData.newPassword}
								onChange={handleInputChange}
							/>
						</label>

						<div className='flex gap-2 justify-end mt-4'>
							<form method='dialog'>
								<button className='btn btn-outline rounded-full btn-sm'>Cancel</button>
							</form>
							<button
								type='submit'
								className='btn btn-primary rounded-full btn-sm text-white px-4'
								disabled={isPending}
							>
								{isPending ? <LoadingSpinner size='sm' /> : "Save"}
							</button>
						</div>
					</form>
				</div>
				<form method='dialog' className='modal-backdrop'>
					<button className='outline-none'>close</button>
				</form>
			</dialog>
		</>
	);
};

export default EditProfileModal;

