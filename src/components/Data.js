import UploadData from "./UploadData";
import Sidebar from "./Sidebar";
const Data = () => {
    return (
        <div>
            <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'} />
            <UploadData />
        </div>

    );
};

export default Data;