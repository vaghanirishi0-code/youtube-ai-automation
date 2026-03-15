export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Platform = string;
export type StepName = string;
export type ProjectId = string;
export interface SocialAccount {
    id: string;
    platform: Platform;
    accountName: string;
    connected: boolean;
    handle: string;
}
export interface Project {
    id: ProjectId;
    status: string;
    title: string;
    platform: Platform;
    videoFile?: ExternalBlob;
    stepFiles: Array<[StepName, ExternalBlob | null]>;
    steps: Array<[StepName, string]>;
    currentStep: StepName;
    screenRatio: string;
    niche: string;
}
export interface backendInterface {
    createProject(project: Project): Promise<void>;
    createSocialAccount(account: SocialAccount): Promise<void>;
    deleteProject(id: ProjectId): Promise<void>;
    deleteSocialAccount(id: string): Promise<void>;
    getProject(id: ProjectId): Promise<Project | null>;
    getSocialAccount(id: string): Promise<SocialAccount | null>;
    listProjects(): Promise<Array<Project>>;
    listSocialAccounts(): Promise<Array<SocialAccount>>;
    updateProject(project: Project): Promise<void>;
    updateSocialAccount(account: SocialAccount): Promise<void>;
}
