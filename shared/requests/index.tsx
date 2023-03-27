export function handleFetchErrors(response: any) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export async function handleFetchErrorsAsString(response: any) {
  if (!response.ok) {
    throw Error(await response.text());
  }
  return response;
}

// fetch can be used for anything except local files, so anything that might
// download from file:// (aka quests) should use this instead
export function fetchLocal(url: string) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onload = () => {
      resolve(request.response);
    };
    request.onerror = () => {
      reject(new Error('network error'));
    };
    request.onabort = () => {
      reject(new Error('connection aborted'));
    };
    request.open('GET', url);
    request.send();
  });
}
