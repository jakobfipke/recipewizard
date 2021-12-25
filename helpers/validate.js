
exports.isValidAuthenticationRequest = (user) => {
  if (!user.email) {
    return [false, "An email is required to authenticate."];
  }
  if (!user.password) {
    return [false, "A password is required to authenticate."];
  }
  if (typeof(user.email) !== "string") {
    return [false, "Email must be a string value."];
  }
  if (typeof(user.password) !== "string") {
    return [false, "Password must be a string value."];
  }
  if (user.email === "") {
    return [false, "Email cannot be an empty string."];
  }
  const emRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
  if (!user.email.match(emRegex)) {
    return [false, "Please enter a valid email address."]
  } 
  if (user.password.length < 6) {
    return [false, "Password must be a minimum six characters"]
  }
  // const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
  // if (!user.password.match(pwRegex)) {
  //   return [false, "Password must be a minimum six characters, and contain at least one uppercase letter, one lowercase letter, and one digit. Special characters are not allowed."]
  // }
  return [true, "This is a valid request."];
}

exports.isValidRecipe = (recipe) => {
  if (recipe.title === null || recipe.title === undefined) {
    return [false, "A title is required to create a recipe."];
  }
  if (recipe.description === null || recipe.description === undefined) {
    return [false, "A description is required to create a recipe."];
  }
  if (typeof(recipe.title) !== "string") {
    return [false, "Title must be a string value."];
  }
  if (typeof(recipe.description) !== "string") {
    return [false, "Description must be a string value."];
  }
  if (recipe.title === "") {
    return [false, "Title cannot be an empty string."];
  }
  if (recipe.title.length > 100) {
    return [false, "Title must be less than 100 characters."];
  }
  if (recipe.description.length > 100) {
    return [false, "Description must be less than 300 characters."];
  }
  return [true, "This is a valid request."];
}