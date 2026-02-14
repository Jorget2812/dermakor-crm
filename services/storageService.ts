import { supabase } from '../utils/supabase';

export interface ProspectDocument {
    id: string;
    prospect_id: string;
    name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    uploaded_by: string;
    created_at: string;
}

export const storageService = {
    /**
     * Uploads a file to Supabase Storage and records metadata
     */
    async uploadDocument(prospectId: string, file: File) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const fileExt = file.name.split('.').pop();
        const fileName = `${prospectId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        // 1. Upload to Storage
        const { error: uploadError } = await supabase.storage
            .from('prospect-documents')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Insert Metadata
        const { data, error: metaError } = await supabase
            .from('prospect_documents')
            .insert({
                prospect_id: prospectId,
                name: file.name,
                file_path: filePath,
                file_type: file.type || fileExt,
                file_size: file.size,
                uploaded_by: user.id
            })
            .select()
            .single();

        if (metaError) {
            // Cleanup storage if metadata fails
            await supabase.storage.from('prospect-documents').remove([filePath]);
            throw metaError;
        }

        return data as ProspectDocument;
    },

    /**
     * Fetches all documents for a prospect
     */
    async listDocuments(prospectId: string) {
        const { data, error } = await supabase
            .from('prospect_documents')
            .select('*')
            .eq('prospect_id', prospectId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as ProspectDocument[];
    },

    /**
     * Generates a signed URL for downloading a file
     */
    async getDownloadUrl(filePath: string) {
        const { data, error } = await supabase.storage
            .from('prospect-documents')
            .createSignedUrl(filePath, 3600); // 1 hour link

        if (error) throw error;
        return data.signedUrl;
    },

    /**
     * Deletes a document from storage and metadata
     */
    async deleteDocument(docId: string, filePath: string) {
        // 1. Delete from Storage
        const { error: storageError } = await supabase.storage
            .from('prospect-documents')
            .remove([filePath]);

        if (storageError) throw storageError;

        // 2. Delete Metadata
        const { error: metaError } = await supabase
            .from('prospect_documents')
            .delete()
            .eq('id', docId);

        if (metaError) throw metaError;
    }
};
