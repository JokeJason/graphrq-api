CREATE CONSTRAINT Requirement_id FOR (node:Requirement) REQUIRE (node.id) IS UNIQUE;
CREATE CONSTRAINT Test_id FOR (node:Test) REQUIRE (node.id) IS UNIQUE;
CREATE CONSTRAINT User_email FOR (node:User) REQUIRE (node.email) IS UNIQUE;
CREATE CONSTRAINT User_id FOR (node:User) REQUIRE (node.id) IS UNIQUE;
UNWIND [{id:"66072539-1ba8-483e-8d81-7025e3e6c50c", properties:{createdAt:datetime('2024-01-06T03:15:08.604Z'), description:"Pokemon Index Web app", title:"Root: PokeRTK", category:"ROOT"}}, {id:"42beb8a6-5521-486e-b62d-1253a187f429", properties:{createdAt:datetime('2024-01-06T03:36:51.581Z'), description:"Users should be able to navigate the app easily to find specific Pokémon.", category:"CUSTOMER", title:"Intuitive Navigation"}}, {id:"4fa2d85b-96d9-4cc3-829a-13cd80765fb3", properties:{createdAt:datetime('2024-01-06T03:38:11.527Z'), description:"The ability to filter Pokémon based on various attributes like region, type, and others.", category:"CUSTOMER", title:"Comprehensive Filtering"}}, {id:"8b796baf-9549-4704-bafa-759c4f398e66", properties:{createdAt:datetime('2024-01-06T03:38:11.527Z'), description:"Users expect to access detailed information about each Pokémon, including abilities and stats.", category:"CUSTOMER", title:"Detailed Pokémon Information"}}, {id:"408c4e1f-5cbc-41c5-886b-cf5280207d8b", properties:{createdAt:datetime('2024-01-06T03:38:11.527Z'), description:"The app should be visually appealing and accessible to users with different abilities.", category:"CUSTOMER", title:"Visual Appeal and Accessibility"}}, {id:"c9cedc98-4543-4d53-b062-3c592313773b", properties:{createdAt:datetime('2024-01-06T03:38:11.527Z'), description:"The app should be usable on various devices, including desktops, tablets, and smartphones.", category:"CUSTOMER", title:"Responsive Design"}}, {id:"fbe9f1ea-b02d-4035-b51b-a99fe3f7e246", properties:{createdAt:datetime('2024-01-06T03:46:27.633Z'), description:"Each Pokémon card displayed should show the Pokémon's number ID, image, and type.", category:"SYSTEM", title:"Display of Pokémon Cards"}}, {id:"4d49936d-f2d0-4e69-a83c-d1664590ae16", properties:{createdAt:datetime('2024-01-06T03:52:24.855Z'), description:"The main page must include a filter bar with selection tabs for region, type, sorting options, and a search bar.", category:"SYSTEM", title:"Filter Bar Functionality", updatedAt:datetime('2024-01-06T04:19:12.236Z')}}, {id:"df2c23ce-f8cd-4280-a54a-1e4302620182", properties:{createdAt:datetime('2024-01-06T04:07:02.28Z'), description:"Each card should have an info icon that, when clicked, displays a detailed information card.", category:"SYSTEM", title:"Info Icon on Pokémon Cards", updatedAt:datetime('2024-01-06T04:19:33.317Z')}}, {id:"852dcb28-a4f4-4132-a4c3-e28369e5d40f", properties:{createdAt:datetime('2024-01-06T04:22:08.656Z'), description:"The detailed information card should include abilities, stats, and other relevant data for each Pokémon.", category:"SYSTEM", title:"Information Card Details", updatedAt:datetime('2024-01-06T04:22:35.39Z')}}, {id:"00e3aa44-af87-4012-b674-f510c0b5181a", properties:{createdAt:datetime('2024-01-06T04:22:53.937Z'), description:"The system must effectively fetch data from the PokeAPI and manage it for display.", category:"SYSTEM", title:"Data Fetching and Management", updatedAt:datetime('2024-01-06T04:23:09.298Z')}}, {id:"4319e0e2-c4de-42de-81ac-3a7ac998019d", properties:{createdAt:datetime('2024-01-06T04:23:26.453Z'), description:"The app should be built using the React framework, adhering to best practices for code organization and component-based architecture.", category:"ENGINEERING", title:"React Framework Implementation", updatedAt:datetime('2024-01-06T04:24:04.08Z')}}, {id:"e1d667c6-f765-45d6-afe1-81c938f1da6c", properties:{createdAt:datetime('2024-01-06T04:32:52.944Z'), description:"Implementation of RESTful API integration for fetching data from PokeAPI.", category:"ENGINEERING", title:"API Integration", updatedAt:datetime('2024-01-06T04:33:21.558Z')}}, {id:"cb530d0e-8d1d-4fab-9b8b-aeb742f5e118", properties:{createdAt:datetime('2024-01-06T04:39:44.396Z'), description:"Efficient state management, possibly using Redux or React Context API, for managing the app's state, especially for the filter functionality.", category:"ENGINEERING", title:" State Management", updatedAt:datetime('2024-01-06T04:40:04.6Z')}}] AS row
CREATE (n:Requirement{id: row.id}) SET n += row.properties;
UNWIND [{start: {id:"408c4e1f-5cbc-41c5-886b-cf5280207d8b"}, end: {id:"66072539-1ba8-483e-8d81-7025e3e6c50c"}, properties:{}}, {start: {id:"42beb8a6-5521-486e-b62d-1253a187f429"}, end: {id:"66072539-1ba8-483e-8d81-7025e3e6c50c"}, properties:{}}, {start: {id:"c9cedc98-4543-4d53-b062-3c592313773b"}, end: {id:"66072539-1ba8-483e-8d81-7025e3e6c50c"}, properties:{}}, {start: {id:"fbe9f1ea-b02d-4035-b51b-a99fe3f7e246"}, end: {id:"4fa2d85b-96d9-4cc3-829a-13cd80765fb3"}, properties:{}}, {start: {id:"4fa2d85b-96d9-4cc3-829a-13cd80765fb3"}, end: {id:"66072539-1ba8-483e-8d81-7025e3e6c50c"}, properties:{}}, {start: {id:"4d49936d-f2d0-4e69-a83c-d1664590ae16"}, end: {id:"42beb8a6-5521-486e-b62d-1253a187f429"}, properties:{}}, {start: {id:"8b796baf-9549-4704-bafa-759c4f398e66"}, end: {id:"66072539-1ba8-483e-8d81-7025e3e6c50c"}, properties:{}}, {start: {id:"df2c23ce-f8cd-4280-a54a-1e4302620182"}, end: {id:"8b796baf-9549-4704-bafa-759c4f398e66"}, properties:{}}, {start: {id:"852dcb28-a4f4-4132-a4c3-e28369e5d40f"}, end: {id:"408c4e1f-5cbc-41c5-886b-cf5280207d8b"}, properties:{}}, {start: {id:"00e3aa44-af87-4012-b674-f510c0b5181a"}, end: {id:"c9cedc98-4543-4d53-b062-3c592313773b"}, properties:{}}, {start: {id:"4319e0e2-c4de-42de-81ac-3a7ac998019d"}, end: {id:"4d49936d-f2d0-4e69-a83c-d1664590ae16"}, properties:{}}, {start: {id:"e1d667c6-f765-45d6-afe1-81c938f1da6c"}, end: {id:"fbe9f1ea-b02d-4035-b51b-a99fe3f7e246"}, properties:{}}, {start: {id:"cb530d0e-8d1d-4fab-9b8b-aeb742f5e118"}, end: {id:"df2c23ce-f8cd-4280-a54a-1e4302620182"}, properties:{}}] AS row
MATCH (start:Requirement{id: row.start.id})
MATCH (end:Requirement{id: row.end.id})
CREATE (start)-[r:CHILD_OF]->(end) SET r += row.properties;