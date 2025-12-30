import toast from 'react-hot-toast';
import { BASE_URL } from '../components/constant/url';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useFollow = () => {
    const queryClient = useQueryClient();
    const { mutate: follow, isPending } = useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch(`${BASE_URL}/api/users/follow/${userId}`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error || 'Failed to follow user');
                }
                return data;
            } catch (error) {
                throw error;
            }
        },
        onSuccess: () => {
            Promise.all([
                queryClient.invalidateQueries({ queryKey: ['suggestedUsers'] }),
                queryClient.invalidateQueries({ queryKey: ['authUser'] }),
            ])
        },
        onError: (error) => {
            toast.error(error.message || 'An error occurred while trying to follow the user.');
        }
    })
    return { follow, isPending };
}
export default useFollow;