export const base44 = {
    auth: {
        logout: async () => {
            console.log("Mock logout called");
            window.location.href = "/";
        }
    },
    integrations: {
        Core: {
            UploadFile: async ({ file }) => {
                console.log("Mock UploadFile called with:", file.name);
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                return { file_url: URL.createObjectURL(file) };
            }
        }
    }
};
