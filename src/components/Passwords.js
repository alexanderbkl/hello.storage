import UploadPasswords from "./UploadPasswords";
import Sidebar from "./Sidebar";
const Passwords = () => {
    return (
        <div>
            <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
            <UploadPasswords />
        </div>

    );
};

export default Passwords;