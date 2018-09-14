export function handleFetchErrors(response: any) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

export async function handleFetchErrorString(response: any) {
  if (!response.ok) {
    throw Error(await response.text());
  }
  return response;
}
