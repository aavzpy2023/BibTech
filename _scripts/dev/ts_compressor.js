const { Project, SyntaxKind } = require('ts-morph');
const fs = require('fs');

// Leer el código fuente desde stdin (enviado por Python)
const code = fs.readFileSync(0, 'utf-8');

// Configurar proyecto en memoria (Soporta TS y TSX)
const project = new Project({ useInMemoryFileSystem: true });
const sourceFile = project.createSourceFile('temp.tsx', code);

try {
    // 1. Vaciar funciones tradicionales (function foo() { ... })
    sourceFile.getFunctions().forEach(f => {
        if (f.hasBody()) f.setBodyText('/* ... */');
    });

    // 2. Vaciar métodos y constructores de clases (class Foo { bar() { ... } })
    sourceFile.getClasses().forEach(c => {
        c.getMethods().forEach(m => {
            if (m.hasBody()) m.setBodyText('/* ... */');
        });
        c.getConstructors().forEach(ctor => ctor.setBodyText('/* ... */'));
    });

    // 3. Vaciar Arrow Functions en variables (const Foo = () => { ... })
    // Fundamental para componentes de React (React.FC)
    sourceFile.getVariableDeclarations().forEach(v => {
        const init = v.getInitializer();
        if (init && init.getKind() === SyntaxKind.ArrowFunction) {
            init.setBodyText('/* ... */');
        }
    });

    // 4. Vaciar exportaciones por defecto de Arrow Functions (export default () => { ... })
    sourceFile.getExportAssignments().forEach(exp => {
        const expr = exp.getExpression();
        if (expr && expr.getKind() === SyntaxKind.ArrowFunction) {
            expr.setBodyText('/* ... */');
        }
    });

    // Imprimir el código comprimido de vuelta a stdout
    process.stdout.write(sourceFile.getFullText());
} catch (error) {
    // Si hay un error severo de parseo, devolver el código original para no romper el pipeline
    process.stdout.write(code);
}
