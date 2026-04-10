const Profile = () => {
    return (
        <div className="flex gap-3 items-center py-4">
            <img src="https://pbs.twimg.com/profile_images/1905287751299112960/x6aktW_9_400x400.jpg" alt="githubProfileImage" className="rounded-full w-10 h-10 block"/>
            <div>
                <p className="text-white open-sans-regular text-xl">Akshat Sharma</p>
                <p>@aksh24_exe</p>
            </div>
        </div>
    )
}

export default Profile;