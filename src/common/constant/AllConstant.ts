export const languageOptions = [
    { id: 1, content_type: "text/x-csrc", description: "GCC 9.4.0", name: "C 11" },
    { id: 2, content_type: "text/x-csrc", description: "GCC 9.4.0", name: "C 11 With O2" },
    { id: 3, content_type: "text/x-c++src", description: "G++ 9.4.0", name: "C++ 11" },
    { id: 4, content_type: "text/x-c++src", description: "G++ 9.4.0", name: "C++ 11 With O2" },
    { id: 5, content_type: "text/x-c++src", description: "G++ 9.4.0", name: "C++ 17" },
    { id: 6, content_type: "text/x-c++src", description: "G++ 9.4.0", name: "C++ 17 With O2" },
    { id: 7, content_type: "text/x-c++src", description: "G++ 9.4.0", name: "C++ 20" },
    { id: 8, content_type: "text/x-c++src", description: "G++ 9.4.0", name: "C++ 20 With O2" },
    { id: 9, content_type: "text/x-java", description: "OpenJDK 1.8", name: "Java" },
    { id: 10, content_type: "text/x-python", description: "Python 3.7.5", name: "Python3" },
];
/**
 *  { id: 11, content_type: "text/x-python", description: "Python 2.7.17", name: "Python2" },
    { id: 12, content_type: "text/x-go", description: "Golang 1.19", name: "Golang" },
    { id: 13, content_type: "text/x-csharp", description: "C# Mono 4.6.2", name: "C#" },
    { id: 14, content_type: "text/x-php", description: "PHP 7.2.24", name: "PHP" },
    { id: 15, content_type: "text/x-python", description: "PyPy 2.7.18 (7.3.8)", name: "PyPy2" },
    { id: 16, content_type: "text/x-python", description: "PyPy 3.9.17 (7.3.12)", name: "PyPy3" },
    { id: 17, content_type: "text/javascript", description: "Node.js 14.19.0", name: "JavaScript Node" },
    { id: 18, content_type: "text/javascript", description: "JavaScript V8 8.4.109", name: "JavaScript V8" }
 */
// 判题状态选项
export const statusOptions = [
    { name: 'Not Submitted', code: '-10' },
    { name: 'Submitting', code: '9' },
    { name: 'Compiling', code: '6' },
    { name: 'Judging', code: '7' },
    { name: 'Compile Error', code: '-2' },
    { name: 'Presentation Error', code: '-3' },
    { name: 'Wrong Answer', code: '-1' },
    { name: 'Accepted', code: '0' },
    { name: 'Time Limit Exceeded', code: '1' },
    { name: 'Memory Limit Exceeded', code: '2' },
    { name: 'Runtime Error', code: '3' },
    { name: 'System Error', code: '4' },
    { name: 'Pending', code: '5' },
    { name: 'Partial Accepted', code: '8' },
    { name: 'Submitted Failed', code: '10' },
    { name: 'No Status', code: '15' }
];
// 判题状态映射
export const statusMap = {
    '-10': 'Not Submitted',
    '9': 'Submitting',
    '6': 'Compiling',
    '7': 'Judging',
    '-2': 'Compile Error',
    '-3': 'Presentation Error',
    '-1': 'Wrong Answer',
    '0': 'Accepted',
    '1': 'Time Limit Exceeded',
    '2': 'Memory Limit Exceeded',
    '3': 'Runtime Error',
    '4': 'System Error',
    '5': 'Pending',
    '8': 'Partial Accepted',
    '10': 'Submitted Failed',
    '15': 'No Status'
};
// 判题状态标签颜色映射
export const statusClassMap = {
    '-10': 'bg-blue-500 text-white',
    '9': 'bg-blue-500 text-white',
    '6': 'bg-blue-500 text-white',
    '7': 'bg-blue-500 text-white',
    '-2': 'bg-yellow-500 text-white',
    '-3': 'bg-yellow-500 text-white',
    '-1': 'bg-red-500 text-white',
    '0': 'bg-green-500 text-white',
    '1': 'tle-color text-white',
    '2': 'tle-color text-white',
    '3': 're-color text-white',
    '4': 'bg-yellow-500 text-white',
    '5': 'bg-blue-500 text-white',
    '8': 'bg-blue-500 text-white',
    '10': 'bg-red-500 text-white',
    '15': 'bg-gray-500 text-white'
};