import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

(async () => {
    const routesPath = path.join(process.cwd(), "dist/routes");
    let files = fs.readdirSync(routesPath, {withFileTypes: true});
    do {
        const file = files.pop()!;
        const full_path = path.join(file.parentPath, file.name);
        if (file.isDirectory()) {
            const newFiles = fs.readdirSync(full_path, { withFileTypes: true});
            files = files.concat(newFiles);
        } else {
            const route = await import(full_path);
            const qualified_path = full_path.slice(routesPath.length).slice(0, -4).replace("{_", "{:") + "/";
            if (route.get) {
                app.get(qualified_path, route.get);
                console.log(`registering: \n\tGET ${qualified_path}\n`);
            }
            if (route.post) {
                app.post(qualified_path, route.post);
                console.log(`registering: \n\tPOST ${qualified_path}\n`);
            }
            if (route.put) {
                app.put(qualified_path, route.put);
                console.log(`registering: \n\tPUT ${qualified_path}\n`);
            }
            if (route.delete) {
                app.delete(qualified_path);
                console.log(`registering: \n\tDELETE ${qualified_path}\n`);
            }
            if (route.all) {
                app.all(qualified_path, route.all);
                console.log(`registering: \n\tALL ${qualified_path}\n`);
            }
        }
    } while (files.length > 0);
})();
app.get("/", async (req, res) => {
    res.send("Welcome to the AlterBlackJack internal API !");
})

app.listen(3497, () => {
    console.log(`Server running on port ${3497}`);
})
