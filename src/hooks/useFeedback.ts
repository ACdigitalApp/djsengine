import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (feedback: { track_id: string; feedback_type: string; related_track_id?: string; notes?: string }) => {
      const { error } = await supabase.from('user_feedback').insert(feedback as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tracks'] }),
  });
}
