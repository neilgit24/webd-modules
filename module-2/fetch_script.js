document.getElementById('search').onclick = fetchProfile;

async function fetchProfile(){
    const username = document.getElementById('username').value;
    const errorele = document.getElementById('error');
    const detailsele = document.getElementById('details');
    errorele.textContent = '';
    detailsele.innerHTML = '';

    if (username === ''){
        errorele.textContent = 'Please enter a username.';
        return;
    }

    try{const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) {
            throw new Error('User not found.');
       }

        const data = await response.json();
        detailsele.innerHTML =
           `<img src='${data.avatar_url}'>
            <p>Bio: ${data.bio || 'No bio available'}</p>
            <p>Public Repositories: ${data.public_repos}</p>
            <p>Followers: ${data.followers}</p>
            <p>Following: ${data.following}</p>
           `;
       } 
    catch (error){
        errorele.textContent = `${error.message}`;
    }
}
