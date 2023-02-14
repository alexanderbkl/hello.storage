export interface IPFSFile {
    cid: string;
    name: string;
    size: number;
    type: string;
    dir: string;
    private: boolean;
    date: number;
}

export interface IPFSPassword {
    date: number;
    title: string,
    username: string;
    password: string;
}

export interface IPFSNote {
    date: number;
    title: string;
    note: string;
}