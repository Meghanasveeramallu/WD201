const request = require("supertest");
var cheerio = require("cheerio");
const database = require("../models/index");
const app = require("../app");
let server, agent;

//this is a function to extract csrf token
function extractCsrfToken(response) {
  var $ = cheerio.load(response.text);
  return $("[name=_csrf]").val();
}

describe("Testing To Do Item ", () => {
  beforeAll(async () => {
    await database.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await database.sequelize.close();
    server.close();
  });

  //Test to create a new To Do Item
  test("Test to Create new a new To Do Item", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "New To Do Item",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(422); //http status code
  });

  // Test for marking the completed status of a To Do Item

  test("Test To mark the completed status of a To Do Item ", async () => {
    const res = await agent.get("/");
    const csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Test to mark the check box",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    // the above added to do item is second in the list of newly added todos
    const todoID = await agent.get("/todos").then((response) => {
      const parsedResponse1 = JSON.parse(response.text);
      return parsedResponse1[1]["id"];
    });

    // Testing for marking the complete check box
    const setCompletionResponse1 = await agent
      .put(`/todos/${todoID}`)
      .send({ completed: true, _csrf: csrfToken });
    const parsedUpdateResponse3 = JSON.parse(setCompletionResponse1.text);
    expect(parsedUpdateResponse3.completed).toBe(true);

    // Testing for unmarking the complete check box
    const setCompletionResponse2 = await agent
      .put(`/todos/${todoID}`)
      .send({ completed: false, _csrf: csrfToken });
    const parsedUpdateResponse2 = JSON.parse(setCompletionResponse2.text);
    expect(parsedUpdateResponse2.completed).toBe(false);
  });
  
 //Test

  test("Marking a To Do Item as complete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Test for marking a To Do Item as complete",
      dueDate: new Date().toLocaleString("en-CA"),
      completed: false,
      _csrf: csrfToken,
    });

    const gropuedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(gropuedTodosResponse.text);
    const countDueDays = parsedGroupedResponse.dueToday.length;
    const latestItem = parsedGroupedResponse.dueToday[countDueDays - 1];


    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);
    console.log(latestItem)
    const markAsCompleteresponse = await agent.put(`todos/${latestItem["id"]}`).send({
      _csrf: csrfToken,
      // completed: status,
    });
    const parsedUpdateResponse = JSON.parse(markAsCompleteresponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });


  //This is a test for Marking a to do as incomplete
  test("This is a test that marks a to Do with given id as incomplete", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Incomplete To DO Test",
      dueDate: new Date().toISOString(),
      completed: true,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponsee = JSON.parse(groupedTodosResponse.text);
    const countCompleted = parsedGroupedResponsee.completedItems.length;
    const latestItemo = parsedGroupedResponsee.completedItems[countCompleted - 1];
    const completed = !latestItemo.completed;
    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const markCompleteResponses = await agent
      .put(`/todos/${latestItemo.id}`)
      .send({
        _csrf: csrfToken,
        completed: completed,
      });

    const parsedUpdateResponses = JSON.parse(markCompleteResponses.text);
    expect(parsedUpdateResponses.completed).toBe(false);
  });

 
  //Test that deletes a To Do with the given ID
  test("Test that deletes a To Do with the given ID", async () => {
    let res = await agent.get("/");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Test that is completed",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const gropuedTodosResponse = await agent
      .get("/")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(gropuedTodosResponse.text);
    const countDueDays = parsedGroupedResponse.dueToday.length;
    const latestItem = parsedGroupedResponse.dueToday[countDueDays - 1];

    res = await agent.get("/");
    csrfToken = extractCsrfToken(res);

    const response = await agent.put(`todos/${latestItem.id}`).send({
      _csrf: csrfToken,
    });
    const parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });
});